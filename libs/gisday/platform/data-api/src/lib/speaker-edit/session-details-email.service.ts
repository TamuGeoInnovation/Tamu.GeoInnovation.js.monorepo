import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SESSION_DETAILS_EMAIL_KIND,
  fillProfileEmail,
  gisdaySite,
  sessionDetailsEmailProblem,
  sessionDetailsEmailSubject,
  sessionDetailsEmailTemplate,
  sessionDetailsEmailValues,
  seasonDaysOf,
  sessionEmailDesign,
  sessionEmailDetails,
  siteEmailHtml
} from '@tamu-gisc/gisday/common';

import { Event, Speaker } from '../entities/all.entity';
import { ContactService } from '../contact/contact.service';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EMAIL_LANES, inParallel } from '../_base/in-parallel';
import {
  ProfileEmail,
  ProfileEmailPreview,
  REPEAT_SEND_MINUTES,
  SendResult,
  fullName,
  looksLikeEmail
} from './speaker-edit.service';

/** The session details email as an admin approved it: its subject and text, with their placeholders. */
export type SessionDetailsEmail = ProfileEmail;

/** The session details email before it is sent, in the shape the review emails' window reads, with who has no address. */
export interface SessionDetailsEmailPreview extends ProfileEmailPreview {
  /** The session's speakers with no email address on their record, by name, who will not be emailed. */
  noAddress: Array<string>;
}

/**
 * A session's speakers emailed its details (#3092), from the session's admin page: prefilled from the session, read and
 * edited first in the window the profile email uses, sent several at a time (#3067), and never twice to one speaker for
 * the same session within `REPEAT_SEND_MINUTES` (#3065).
 *
 * The repeat guard is kept by this API process, as nothing else records these emails: a repeat that reaches the same
 * process is caught, one that reaches another pod is not. The profile email's guard reads its links table, which every
 * pod shares.
 */
@Injectable()
export class SessionDetailsEmailService {
  /** When each speaker was last sent each session's details, by `<session>:<speaker>`, in milliseconds. */
  private readonly lastSent = new Map<string, number>();

  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    private readonly contact: ContactService
  ) {}

  /**
   * The email the session's speakers would get, for the admin to read and edit first: the text prefilled from the
   * session, an example for the first speaker with an address, and who has none. Nothing is sent.
   */
  public async preview(eventGuid: string, host?: string): Promise<SessionDetailsEmailPreview> {
    const session = await this.sessionOf(eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const { reachable, noAddress } = speakersOf(session);

    if (reachable.length === 0) {
      return { groups: [], noAddress: noAddress.map(fullName) };
    }

    const [first] = reachable;

    return {
      groups: [
        {
          kind: SESSION_DETAILS_EMAIL_KIND,
          label: 'Session details',
          count: reachable.length,
          subject: sessionDetailsEmailSubject(session),
          template: sessionDetailsEmailTemplate(session, site.address),
          // What the window needs to show the whole email as it will arrive (#3114).
          design: sessionEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session)),
          example: {
            title: fullName(first),
            to: first.email.trim(),
            cc: '',
            values: sessionDetailsEmailValues(first, site)
          }
        }
      ],
      noAddress: noAddress.map(fullName)
    };
  }

  /**
   * Emails each of the session's speakers its details, in the subject and text the admin approved, or as prefilled when
   * none is given. A speaker with no address, or sent this session's details in the last `REPEAT_SEND_MINUTES`, is
   * skipped and named with why. `sender` is who it is from, as the admin chose and the controller checked (#3100), or the
   * site.
   */
  public async send(
    eventGuid: string,
    host?: string,
    email?: SessionDetailsEmail,
    sender?: EmailSender
  ): Promise<SendResult> {
    const problem = email === undefined ? null : sessionDetailsEmailProblem(email);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const session = await this.sessionOf(eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const approved = email ?? {
      subject: sessionDetailsEmailSubject(session),
      template: sessionDetailsEmailTemplate(session, site.address)
    };
    const { reachable, noAddress } = speakersOf(session);
    const from = sender ?? siteSender(site.name);
    const design = sessionEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session));
    const result: SendResult = {
      sent: [],
      skipped: noAddress.map((s) => ({ name: fullName(s), reason: 'no email address on their record' }))
    };

    // Several at a time (#3067), as the profile email: one by one, a long send waited long enough to be repeated (#3065).
    const parts = await inParallel(reachable, EMAIL_LANES, async (speaker) => {
      const part: SendResult = { sent: [], skipped: [] };
      const name = fullName(speaker);
      const key = `${session.guid}:${speaker.guid}`;
      const now = Date.now();

      // Recorded before the email goes, with nothing awaited between the check and the record, so two sends racing in
      // this process skip each other's speakers.
      if (now - (this.lastSent.get(key) ?? -Infinity) <= REPEAT_SEND_MINUTES * 60 * 1000) {
        part.skipped.push({
          name,
          reason: `already emailed this session's details in the last ${REPEAT_SEND_MINUTES} minutes`
        });
        return part;
      }

      this.lastSent.set(key, now);

      try {
        const { subject, text } = fillProfileEmail(approved, sessionDetailsEmailValues(speaker, site));

        await this.contact.sendMessage(
          {
            to: speaker.email.trim(),
            ...from,
            subject,
            text,
            // The Markdown as HTML (#3044), in Texas A&M's design on its site (#3114), beside the plain text.
            html: siteEmailHtml(text, { site, subject, from: from.from, design })
          },
          true
        );
        part.sent.push(name);
      } catch (err) {
        // Not sent, so not a repeat: the admin may try again at once.
        this.lastSent.delete(key);
        Logger.error(
          `Could not email session ${session.guid}'s details to speaker ${speaker.guid}: ${err.message}`,
          'SessionDetailsEmailService'
        );
        part.skipped.push({ name, reason: 'the email could not be sent' });
      }

      return part;
    });

    result.sent.push(...parts.flatMap((p) => p.sent));
    result.skipped.push(...parts.flatMap((p) => p.skipped));
    this.forgetOld();

    return result;
  }

  /** The session, with what its email reads: its day, room, broadcast and speakers. */
  private async sessionOf(eventGuid: string): Promise<Event> {
    if (typeof eventGuid !== 'string' || !eventGuid.trim()) {
      throw new BadRequestException('No session was named.');
    }

    const session = await this.events.findOne({
      where: { guid: eventGuid },
      // The season's days for the email's design on Texas A&M's site (#3114).
      relations: { day: true, location: true, broadcast: true, speakers: true, season: { days: true } }
    });

    if (!session) {
      throw new NotFoundException('That session does not exist.');
    }

    return session;
  }

  /** Drops records older than the guard, so the map holds only the last few minutes' sends. */
  private forgetOld() {
    const since = Date.now() - REPEAT_SEND_MINUTES * 60 * 1000;

    for (const [key, at] of this.lastSent) {
      if (at < since) {
        this.lastSent.delete(key);
      }
    }
  }
}

/** The session's speakers with an address to email, and those with none. */
function speakersOf(session: Event): { reachable: Array<Speaker>; noAddress: Array<Speaker> } {
  const speakers = session.speakers ?? [];

  return {
    reachable: speakers.filter((s) => looksLikeEmail(s.email)),
    noAddress: speakers.filter((s) => !looksLikeEmail(s.email))
  };
}
