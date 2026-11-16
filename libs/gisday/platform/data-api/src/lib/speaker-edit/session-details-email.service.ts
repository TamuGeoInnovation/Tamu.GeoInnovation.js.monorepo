import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import {
  SESSION_DETAILS_EMAIL_KIND,
  emailHtml,
  fillProfileEmail,
  gisdaySite,
  sessionDetailsEmailProblem,
  sessionDetailsEmailSubject,
  sessionDetailsEmailTemplate,
  sessionDetailsEmailValues
} from '@tamu-gisc/gisday/common';

import { Event, SessionDetailsSend, Speaker } from '../entities/all.entity';
import { ContactService } from '../contact/contact.service';
import { senderAs } from '../_base/site-of-request';
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
 * Each send is recorded in `session_details_sends` (#3098), which every copy of the API shares, so a repeat is caught
 * whichever copy it reaches. Until then the guard was kept in each copy's memory, and production runs two.
 */
@Injectable()
export class SessionDetailsEmailService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(SessionDetailsSend) private readonly sends: Repository<SessionDetailsSend>,
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
   * skipped and named with why. `sentBy` is the admin's account id, recorded with each send (#3098).
   */
  public async send(eventGuid: string, host?: string, email?: SessionDetailsEmail, sentBy?: string): Promise<SendResult> {
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
    const result: SendResult = {
      sent: [],
      skipped: noAddress.map((s) => ({ name: fullName(s), reason: 'no email address on their record' }))
    };

    // Several at a time (#3067), as the profile email: one by one, a long send waited long enough to be repeated (#3065).
    const parts = await inParallel(reachable, EMAIL_LANES, async (speaker) => {
      const part: SendResult = { sent: [], skipped: [] };
      const name = fullName(speaker);

      // Recorded first, then checked (#3098): this send stands only if it is the earliest for this session and speaker
      // in the last `REPEAT_SEND_MINUTES`. Two sends racing, in one copy of the API or in two, each record theirs and
      // then agree which came first, so exactly one goes.
      const record = await this.sends.save(
        this.sends.create({ session: { guid: session.guid }, speaker: { guid: speaker.guid }, sentBy: sentBy ?? null })
      );
      const since = new Date(Date.now() - REPEAT_SEND_MINUTES * 60 * 1000);
      const recent = await this.sends.find({
        where: { session: { guid: session.guid }, speaker: { guid: speaker.guid }, created: MoreThan(since) }
      });

      if (firstOf([...recent, record]).guid !== record.guid) {
        await this.sends.delete({ guid: record.guid });
        part.skipped.push({
          name,
          reason: `already emailed this session's details in the last ${REPEAT_SEND_MINUTES} minutes`
        });
        return part;
      }

      try {
        const { subject, text } = fillProfileEmail(approved, sessionDetailsEmailValues(speaker, site));

        await this.contact.sendMessage(
          {
            to: speaker.email.trim(),
            from: senderAs(site.name, process.env.MAILROOM_FROM),
            replyTo: process.env.MAILROOM_TO,
            subject,
            text,
            // The Markdown as HTML, beside the plain text (#3044).
            html: emailHtml(text)
          },
          true
        );
        part.sent.push(name);
      } catch (err) {
        // Not sent, so not a repeat: the admin may try again at once.
        await this.sends.delete({ guid: record.guid });
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

    return result;
  }

  /** The session, with what its email reads: its day, room, broadcast and speakers. */
  private async sessionOf(eventGuid: string): Promise<Event> {
    if (typeof eventGuid !== 'string' || !eventGuid.trim()) {
      throw new BadRequestException('No session was named.');
    }

    const session = await this.events.findOne({
      where: { guid: eventGuid },
      relations: { day: true, location: true, broadcast: true, speakers: true }
    });

    if (!session) {
      throw new NotFoundException('That session does not exist.');
    }

    return session;
  }
}

/** The earliest of some sends: by when, then by guid, so every copy of the API picks the same one. */
function firstOf(sends: Array<Pick<SessionDetailsSend, 'guid' | 'created'>>): Pick<SessionDetailsSend, 'guid' | 'created'> {
  return [...sends].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime() || a.guid.localeCompare(b.guid)
  )[0];
}

/** The session's speakers with an address to email, and those with none. */
function speakersOf(session: Event): { reachable: Array<Speaker>; noAddress: Array<Speaker> } {
  const speakers = session.speakers ?? [];

  return {
    reachable: speakers.filter((s) => looksLikeEmail(s.email)),
    noAddress: speakers.filter((s) => !looksLikeEmail(s.email))
  };
}
