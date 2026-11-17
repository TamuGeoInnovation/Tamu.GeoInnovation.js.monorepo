import { BadRequestException, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  JUDGING_COPY_EACH,
  JUDGING_EMAIL_KIND,
  JUDGING_LINK_PREVIEW,
  JudgedCompetition,
  fillProfileEmail,
  gisdaySite,
  hasEmailDesign,
  isJudgedCompetition,
  judgingEmailDesign,
  judgingEmailProblem,
  judgingEmailSubject,
  judgingEmailTemplate,
  judgingEmailValues,
  seasonDaysOf,
  sessionEmailDetails,
  siteEmailHtml
} from '@tamu-gisc/gisday/common';

import { Event, Speaker } from '../entities/all.entity';
import { ContactService } from '../contact/contact.service';
import { EmailSender, siteSender } from '../contact/email-sender.service';
import { EMAIL_LANES, inParallel } from '../_base/in-parallel';
import { RecentSends } from '../_base/recent-sends';
import { EmailSendLog } from '../speaker-edit/email-send-log';
import {
  SessionDetailsEmail,
  SessionDetailsEmailPreview,
  sessionForEmail
} from '../speaker-edit/session-details-email.service';
import {
  REPEAT_SEND_MINUTES,
  SendResult,
  SpeakerEditService,
  chosenSpeakers,
  fullName,
  linkExpiry,
  looksLikeEmail,
  recipientOf
} from '../speaker-edit/speaker-edit.service';

/** The Ask to judge email as an admin approved it: its subject and text, with their placeholders. */
export type JudgingEmail = SessionDetailsEmail;

/**
 * A session's judges asked to judge its competition (#3183), the fourth of a session's "Email these speakers" emails,
 * modelled on the Ask for slides email (#3113): prefilled from the session, read and edited first in the composer the
 * other speaker emails use, sent several at a time (#3067), never twice to one judge for the same session within
 * `REPEAT_SEND_MINUTES` (#3065), and recorded (#3167).
 *
 * It goes to the session's judges only, never its other speakers, and only when the session judges a competition. Each
 * copy carries that judge's own judging link (decided 3B: a link and an email of their own, not the presenter's edit
 * link), so it only ever goes as a copy each.
 */
@Injectable()
export class JudgingEmailService {
  /** When each judge was last asked for each session, by `<session>:<speaker>`. */
  private readonly lastSent = new RecentSends(REPEAT_SEND_MINUTES);

  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    private readonly contact: ContactService,
    private readonly speakerEdits: SpeakerEditService,
    /** The record of what each speaker was sent (#3167). */
    @Optional() private readonly sendLog?: EmailSendLog
  ) {}

  /**
   * The email the session's judges would get, for the admin to read and edit first: the text prefilled from the session
   * and its competition, an example for the first judge with an address, their link a stand-in, each of them to tick, why
   * it goes as a copy each, and who has no address. No link is made and nothing is sent.
   */
  public async preview(eventGuid: string, host?: string): Promise<SessionDetailsEmailPreview> {
    const { session, competition, judges } = await this.judgingSession(eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const reachable = judges.filter((j) => looksLikeEmail(j.email));
    const noAddress = judges.filter((j) => !looksLikeEmail(j.email)).map(fullName);

    if (reachable.length === 0) {
      return { groups: [], noAddress };
    }

    const [first] = reachable;

    return {
      groups: [
        {
          kind: JUDGING_EMAIL_KIND,
          label: 'Ask to judge',
          count: reachable.length,
          subject: judgingEmailSubject(competition),
          template: judgingEmailTemplate(session, competition, hasEmailDesign(site)),
          design: judgingEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session)),
          example: {
            title: fullName(first),
            to: first.email.trim(),
            cc: '',
            values: judgingEmailValues(first, site, JUDGING_LINK_PREVIEW, linkExpiry())
          }
        }
      ],
      recipients: this.sendLog
        ? await this.sendLog.withSends(reachable.map(recipientOf), JUDGING_EMAIL_KIND, session.guid)
        : reachable.map(recipientOf),
      copyEachReason: JUDGING_COPY_EACH,
      noAddress
    };
  }

  /**
   * Asks the session's judges to judge, a copy each with their own judging link, in the subject and text the admin
   * approved, or as prefilled. `speakers` are those ticked; without them, every judge with an address, and those with none
   * are named as skipped. Only the session's judges: a ticked id of anyone else is not one of them.
   */
  public async send(
    eventGuid: string,
    host?: string,
    email?: JudgingEmail,
    sender?: EmailSender,
    speakers?: Array<string>
  ): Promise<SendResult> {
    const problem = email === undefined ? null : judgingEmailProblem(email);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const ticked = chosenSpeakers(speakers);
    const { session, competition, judges } = await this.judgingSession(eventGuid);
    const site = gisdaySite(process.env.GISDAY_SITE, host);
    const approved = email ?? {
      subject: judgingEmailSubject(competition),
      template: judgingEmailTemplate(session, competition, hasEmailDesign(site))
    };
    const reachable = judges.filter((j) => looksLikeEmail(j.email));
    const noAddress = judges.filter((j) => !looksLikeEmail(j.email));
    const from = sender ?? siteSender(site.name);
    const design = judgingEmailDesign(site.name, seasonDaysOf(session.season), sessionEmailDetails(session));
    const chosen = ticked ? reachable.filter((s) => ticked.includes(s.guid)) : reachable;

    if (ticked && chosen.length === 0) {
      throw new BadRequestException('None of the speakers chosen is a judge of this session with an email address.');
    }

    const result: SendResult = {
      sent: [],
      skipped: ticked ? [] : noAddress.map((s) => ({ name: fullName(s), reason: 'no email address on their record' }))
    };

    const parts = await inParallel(chosen, EMAIL_LANES, async (judge) => {
      const part: SendResult = { sent: [], skipped: [] };
      const name = fullName(judge);
      const keys = [`${session.guid}:${judge.guid}`];

      if (!this.lastSent.claim(keys)) {
        part.skipped.push({
          name,
          reason: `already asked to judge this session in the last ${REPEAT_SEND_MINUTES} minutes`
        });
        return part;
      }

      try {
        // Their own judging link, which opens only the judging page (#3183).
        const { url, expires } = await this.speakerEdits.newLink(judge, host, 'judging');
        const { subject, text } = fillProfileEmail(approved, judgingEmailValues(judge, site, url, expires));

        await this.contact.sendMessage(
          {
            to: judge.email.trim(),
            ...from,
            subject,
            text,
            html: siteEmailHtml(text, { site, subject, from: from.from, design })
          },
          true
        );
        part.sent.push(name);
        await this.sendLog?.record([judge], JUDGING_EMAIL_KIND, session.guid, from.from);
      } catch (err) {
        this.lastSent.release(keys);
        Logger.error(
          `Could not ask speaker ${judge.guid} to judge session ${session.guid}: ${err.message}`,
          'JudgingEmailService'
        );
        part.skipped.push({ name, reason: 'the email could not be sent' });
      }

      return part;
    });

    result.sent.push(...parts.flatMap((p) => p.sent));
    result.skipped.push(...parts.flatMap((p) => p.skipped));
    this.lastSent.forgetOld();

    return result;
  }

  /** The session, its judged competition and its judges, unless it judges no competition or has no judges. */
  private async judgingSession(
    eventGuid: string
  ): Promise<{ session: Event; competition: JudgedCompetition; judges: Array<Speaker> }> {
    const session = await sessionForEmail(this.events, eventGuid);

    if (!isJudgedCompetition(session.judgedCompetition)) {
      throw new BadRequestException('This session judges no competition. Choose its judged competition and save it first.');
    }

    const withJudges = await this.events.findOne({ where: { guid: session.guid }, relations: { judges: true } });
    const judges = withJudges?.judges ?? [];

    if (judges.length === 0) {
      throw new BadRequestException('This session has no judges. Tick its judges and save it first.');
    }

    return { session, competition: session.judgedCompetition, judges };
  }
}
