import { BadRequestException, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  FIRST_NAME_PLACEHOLDER,
  SESSION_DETAILS_EMAIL_KIND,
  fillProfileEmail,
  gisdaySite,
  hasEmailDesign,
  joinNames,
  sessionDetailsEmailProblem,
  sessionDetailsEmailSubject,
  sessionDetailsEmailTemplate,
  sessionDetailsEmailValues,
  seasonDaysOf,
  sessionEmailDesign,
  sessionEmailDetails,
  siteEmailHtml,
  togetherFirstNames,
  togetherTo
} from '@tamu-gisc/gisday/common';

import { Event, Speaker } from '../entities/all.entity';
import { ContactService } from '../contact/contact.service';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EMAIL_LANES, inParallel } from '../_base/in-parallel';
import { EmailSendLog } from './email-send-log';
import { RepeatGuard } from './repeat-guard';
import {
  ProfileEmail,
  ProfileEmailPreview,
  REPEAT_SEND_MINUTES,
  SendResult,
  chosenSpeakers,
  fullName,
  looksLikeEmail,
  recipientOf
} from './speaker-edit.service';

/** The session details email as an admin approved it: its subject and text, with their placeholders. */
export type SessionDetailsEmail = ProfileEmail;

/** The session details email before it is sent, in the shape the review emails' window reads, with who has no address. */
export interface SessionDetailsEmailPreview extends ProfileEmailPreview {
  /** The session's speakers with no email address on their record, by name, who will not be emailed. */
  noAddress: Array<string>;
}

/** Who of the session's speakers it goes to, as ticked in the window, and whether in one email together (#3104). */
export interface SpeakerChoice {
  /** The speakers ticked, by id; every one with an address when not given. */
  speakers?: Array<string>;

  /** One email with every one of them on To, rather than a copy each. */
  together?: boolean;
}

/**
 * A session's speakers emailed its details (#3092), from the session's admin page: prefilled from the session, read and
 * edited first in the window the profile email uses, sent several at a time (#3067), and never twice to one speaker for
 * the same session within `REPEAT_SEND_MINUTES` (#3065).
 *
 * The admin ticks which speakers get it, and sends one email to all of them together or a copy each (#3104). Together,
 * every one is on To and `{first name}` names them all; the repeat guard counts it once, for its whole group.
 *
 * Each send is claimed before it goes, in the table every copy of the API shares (`RepeatGuard`, #3098), so a repeat is
 * caught whichever copy it reaches.
 */
@Injectable()
export class SessionDetailsEmailService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    private readonly repeats: RepeatGuard,
    private readonly contact: ContactService,
    /** The record of what each speaker was sent (#3167). */
    @Optional() private readonly sendLog?: EmailSendLog
  ) {}

  /**
   * The email the session's speakers would get, for the admin to read and edit first: the text prefilled from the
   * session, an example for the first speaker with an address, each of them to tick (#3104), and who has none. Nothing
   * is sent.
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
          template: sessionDetailsEmailTemplate(session, site.address, hasEmailDesign(site)),
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
      // Nothing in it is one speaker's own, so it may go to them together: no `copyEachReason`. Each with when they were
      // sent this session's details before (#3167).
      recipients: this.sendLog
        ? await this.sendLog.withSends(reachable.map(recipientOf), SESSION_DETAILS_EMAIL_KIND, session.guid)
        : reachable.map(recipientOf),
      noAddress: noAddress.map(fullName)
    };
  }

  /**
   * Emails the session's speakers its details, in the subject and text the admin approved, or as prefilled when none is
   * given. `choice` is who was ticked and whether together (#3104); without it, every speaker with an address gets a copy
   * each, and those with none are named as skipped. A speaker, or a together email's group, sent this session's details
   * in the last `REPEAT_SEND_MINUTES` is skipped and named with why. `sender` is who it is from, as the admin chose and
   * the controller checked (#3100), or the site.
   */
  public async send(
    eventGuid: string,
    host?: string,
    email?: SessionDetailsEmail,
    sender?: EmailSender,
    choice?: SpeakerChoice
  ): Promise<SendResult> {
    const problem = email === undefined ? null : sessionDetailsEmailProblem(email);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const ticked = chosenSpeakers(choice?.speakers);
    const session = await this.sessionOf(eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const approved = email ?? {
      subject: sessionDetailsEmailSubject(session),
      template: sessionDetailsEmailTemplate(session, site.address, hasEmailDesign(site))
    };
    const { reachable, noAddress } = speakersOf(session);
    const from = sender ?? siteSender(site.name);
    const design = sessionEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session));
    // Only the session's own speakers, of those ticked: an id from anywhere else is not one of them.
    const chosen = ticked ? reachable.filter((s) => ticked.includes(s.guid)) : reachable;

    if (ticked && chosen.length === 0) {
      throw new BadRequestException('None of the speakers chosen is on this session with an email address.');
    }

    const result: SendResult = {
      sent: [],
      // Those with no address are named when everyone was meant; when the admin ticked, the window already named them.
      skipped: ticked ? [] : noAddress.map((s) => ({ name: fullName(s), reason: 'no email address on their record' }))
    };
    // One email to them all together, or one each (#3104). Together with one ticked is that one's own copy.
    const emails: Array<Array<Speaker>> = choice?.together && chosen.length > 1 ? [chosen] : chosen.map((s) => [s]);

    // Several at a time (#3067), as the profile email: one by one, a long send waited long enough to be repeated (#3065).
    const parts = await inParallel(emails, EMAIL_LANES, async (group) => {
      const part: SendResult = { sent: [], skipped: [] };
      // A together email is one email, so it is named, sent, skipped or failed once, for its whole group (#3104).
      const name = joinNames(group.map(fullName));
      // Recorded before the email goes, in the table every copy of the API shares (#3098), so two sends racing, in one
      // copy or in two, skip each other's speakers. A group is a repeat if any of it was sent these details just now.
      const claimed = await this.repeats.claim(SESSION_DETAILS_EMAIL_KIND, session.guid, group);

      if (!claimed) {
        part.skipped.push({
          name,
          reason: `already emailed this session's details in the last ${REPEAT_SEND_MINUTES} minutes`
        });
        return part;
      }

      try {
        const values = sessionDetailsEmailValues(group[0], site);
        const { subject, text } = fillProfileEmail(
          approved,
          // Together, `{first name}` names them all: "Sharmin and Colby", "Ana, Ben and Cara".
          group.length > 1 ? { ...values, [FIRST_NAME_PLACEHOLDER]: togetherFirstNames(group) } : values
        );

        await this.contact.sendMessage(
          {
            // Together, every one on To, so they see each other and can reply to all.
            to: togetherTo(group),
            ...from,
            subject,
            text,
            // The Markdown as HTML (#3044), in Texas A&M's design on its site (#3114), beside the plain text.
            html: siteEmailHtml(text, { site, subject, from: from.from, design })
          },
          true
        );
        part.sent.push(name);
        // Recorded once it has gone (#3167): together, once for each speaker on it.
        await this.sendLog?.record(group, SESSION_DETAILS_EMAIL_KIND, session.guid, from.from);
      } catch (err) {
        // Not sent, so not a repeat: the admin may try again at once.
        await this.repeats.release(claimed);
        Logger.error(
          `Could not email session ${session.guid}'s details to speaker(s) ${group.map((s) => s.guid).join(', ')}: ${
            err.message
          }`,
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
  private sessionOf(eventGuid: string): Promise<Event> {
    return sessionForEmail(this.events, eventGuid);
  }
}

/**
 * The session a speaker email is about, with what its emails read: its day, room, broadcast and speakers. The session
 * details email (#3092) and the Ask for slides email (#3113) both.
 */
export async function sessionForEmail(events: Repository<Event>, eventGuid: string): Promise<Event> {
  if (typeof eventGuid !== 'string' || !eventGuid.trim()) {
    throw new BadRequestException('No session was named.');
  }

  const session = await events.findOne({
    where: { guid: eventGuid },
    // The season's days for the email's design on Texas A&M's site (#3114).
    relations: { day: true, location: true, broadcast: true, speakers: true, season: { days: true } }
  });

  if (!session) {
    throw new NotFoundException('That session does not exist.');
  }

  return session;
}

/** The session's speakers with an address to email, and those with none. */
export function speakersOf(session: Event): { reachable: Array<Speaker>; noAddress: Array<Speaker> } {
  const speakers = session.speakers ?? [];

  return {
    reachable: speakers.filter((s) => looksLikeEmail(s.email)),
    noAddress: speakers.filter((s) => !looksLikeEmail(s.email))
  };
}
