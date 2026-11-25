import { BadRequestException, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NO_SLIDES_FOR_SESSION,
  PROFILE_EDIT_LINK_PREVIEW,
  SLIDES_REQUEST_COPY_EACH,
  SLIDES_REQUEST_EMAIL_KIND,
  fillProfileEmail,
  gisdaySite,
  hasEmailDesign,
  profileEmailValues,
  seasonDaysOf,
  sessionEmailDesign,
  sessionEmailDetails,
  siteEmailHtml,
  slidesRequestEmailProblem,
  slidesRequestEmailSubject,
  slidesRequestEmailTemplate
} from '@tamu-gisc/gisday/common';

import { Event } from '../entities/all.entity';
import { ContactService } from '../contact/contact.service';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EmailSendLog } from './email-send-log';
import { RepeatGuard, sendEach } from './repeat-guard';
import {
  SessionDetailsEmail,
  SessionDetailsEmailPreview,
  sessionForEmail,
  speakersOf
} from './session-details-email.service';
import { SendResult, SpeakerEditService, chosenSpeakers, fullName, linkExpiry, recipientOf } from './speaker-edit.service';

/** The Ask for slides email as an admin approved it: its subject and text, with their placeholders. */
export type SlidesRequestEmail = SessionDetailsEmail;

/**
 * A session's speakers asked for their slides (#3113), the third of a session's "Email these speakers" emails: prefilled
 * from the session, read and edited first in the composer the other speaker emails use, sent several at a time (#3067),
 * and never twice to one speaker for the same session within `REPEAT_SEND_MINUTES` (#3065).
 *
 * Each copy carries that speaker's own edit link, made as the profile email makes them (`SpeakerEditService.newLink`), to
 * their presenter page, where "Your sessions" takes their slides (#3093). So it only ever goes as a copy each (decided 1A):
 * the admin ticks who gets it (#3104), and the composer offers no "together".
 */
@Injectable()
export class SlidesRequestEmailService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    private readonly repeats: RepeatGuard,
    private readonly contact: ContactService,
    private readonly speakerEdits: SpeakerEditService,
    /** The record of what each speaker was sent (#3167). */
    @Optional() private readonly sendLog?: EmailSendLog
  ) {}

  /**
   * The email the session's speakers would get, for the admin to read and edit first: the text prefilled from the session,
   * an example for the first speaker with an address, their link a stand-in, each of them to tick, why it goes as a copy
   * each, and who has no address. No link is made and nothing is sent.
   */
  public async preview(eventGuid: string, host?: string): Promise<SessionDetailsEmailPreview> {
    const session = await slidesSession(this.events, eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const { reachable, noAddress } = speakersOf(session);

    if (reachable.length === 0) {
      return { groups: [], noAddress: noAddress.map(fullName) };
    }

    const [first] = reachable;

    return {
      groups: [
        {
          kind: SLIDES_REQUEST_EMAIL_KIND,
          label: 'Ask for slides',
          count: reachable.length,
          subject: slidesRequestEmailSubject(session),
          template: slidesRequestEmailTemplate(session, hasEmailDesign(site)),
          // What the window needs to show the whole email as it will arrive, in Texas A&M's design (#3126).
          design: sessionEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session)),
          example: {
            title: fullName(first),
            to: first.email.trim(),
            cc: '',
            values: profileEmailValues(first, site, PROFILE_EDIT_LINK_PREVIEW, linkExpiry())
          }
        }
      ],
      // Each with when they were asked for this session's slides before (#3167).
      recipients: this.sendLog
        ? await this.sendLog.withSends(reachable.map(recipientOf), SLIDES_REQUEST_EMAIL_KIND, session.guid)
        : reachable.map(recipientOf),
      // A copy each only: one email to several would give each the others' links.
      copyEachReason: SLIDES_REQUEST_COPY_EACH,
      noAddress: noAddress.map(fullName)
    };
  }

  /**
   * Asks the session's speakers for their slides, a copy each with their own link, in the subject and text the admin
   * approved, or as prefilled when none is given. `speakers` are those ticked (#3104); without them, every speaker with an
   * address, and those with none are named as skipped. A speaker asked for this session's slides in the last
   * `REPEAT_SEND_MINUTES` is skipped and named with why. `sender` is who it is from, as the admin chose and the controller
   * checked (#3100), or the site.
   */
  public async send(
    eventGuid: string | undefined,
    host?: string,
    email?: SlidesRequestEmail,
    sender?: EmailSender,
    speakers?: Array<string>
  ): Promise<SendResult> {
    const problem = email === undefined ? null : slidesRequestEmailProblem(email);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const ticked = chosenSpeakers(speakers);
    const session = await slidesSession(this.events, eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const approved = email ?? {
      subject: slidesRequestEmailSubject(session),
      template: slidesRequestEmailTemplate(session, hasEmailDesign(site))
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

    // Several at a time (#3067), a copy each, each claimed before the link is made and the email goes, in the table every
    // copy of the API shares (#3260), so two sends racing, in one copy or in two, skip each other's.
    const each = await sendEach(
      this.repeats,
      chosen.map((s) => [s]),
      {
        kind: SLIDES_REQUEST_EMAIL_KIND,
        sessionGuid: session.guid,
        name: ([speaker]) => fullName(speaker),
        repeated: "already asked for this session's slides",
        send: async ([speaker]) => {
          // Their own link, the profile email's kind: only they may upload through it.
          const { url, expires } = await this.speakerEdits.newLink(speaker, host);
          const { subject, text } = fillProfileEmail(approved, profileEmailValues(speaker, site, url, expires));

          await this.contact.sendMessage(
            {
              to: speaker.email.trim(),
              ...from,
              subject,
              text,
              // The Markdown as HTML (#3044), in Texas A&M's design on its site (#3126), beside the plain text.
              html: siteEmailHtml(text, { site, subject, from: from.from, design })
            },
            true
          );
        },
        // Recorded once it has gone (#3167).
        sent: (group) => this.sendLog?.record(group, SLIDES_REQUEST_EMAIL_KIND, session.guid, from.from),
        failed: ([speaker], err) =>
          Logger.error(
            `Could not ask speaker ${speaker.guid} for session ${session.guid}'s slides: ${err.message}`,
            'SlidesRequestEmailService'
          )
      }
    );

    result.sent.push(...each.sent);
    result.skipped.push(...each.skipped);

    return result;
  }
}

/**
 * The session, for its Ask for slides email, unless it has no slides (#3147): then nobody is asked for any, whether the
 * admin's page offers the email or not.
 */
async function slidesSession(events: Repository<Event>, eventGuid: string | undefined): Promise<Event> {
  const session = await sessionForEmail(events, eventGuid);

  if (session.noSlides) {
    throw new BadRequestException(`${NO_SLIDES_FOR_SESSION} Its speakers are not asked for any.`);
  }

  return session;
}
