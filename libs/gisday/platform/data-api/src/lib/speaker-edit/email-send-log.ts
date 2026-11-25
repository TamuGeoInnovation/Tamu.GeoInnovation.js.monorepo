import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EmailRecipient, EmailSends } from '@tamu-gisc/gisday/common';

import { Speaker, SpeakerEmailSend } from '../entities/all.entity';

/**
 * The record of every email the site sends a speaker (#3167): the profile email, a session's details and the Ask for slides
 * email, whichever page it was sent from, so the competition submitters the submissions page emails are counted too.
 *
 * Each copy sent is one row; a "together" email is one row per speaker on it. A row is written only after its email went,
 * and failing to write it never fails the send: the email has already gone.
 */
@Injectable()
export class EmailSendLog {
  constructor(@InjectRepository(SpeakerEmailSend) private readonly sends: Repository<SpeakerEmailSend>) {}

  /** Records that `kind` was just sent to each of `speakers`, about the session `eventGuid` if it was a session's. */
  public async record(
    speakers: ReadonlyArray<Pick<Speaker, 'guid' | 'email'>>,
    kind: string,
    eventGuid: string | null,
    from?: string
  ): Promise<void> {
    if (speakers.length === 0) {
      return;
    }

    try {
      await this.sends.save(
        speakers.map((s) =>
          this.sends.create({
            speaker: { guid: s.guid } as Speaker,
            kind,
            eventGuid,
            sentTo: s.email?.trim() || null,
            sentFrom: from ?? null
          })
        )
      );
    } catch (err) {
      Logger.error(
        `Sent ${kind} to ${speakers.length} speaker(s) but could not record it: ${err.message}`,
        'EmailSendLog'
      );
    }
  }

  /**
   * What each speaker was sent before (#3167), for the email about to be sent: when they were sent this one (this kind,
   * and for a session's email, this session), newest first, and every other email they were sent.
   */
  public async historyOf(
    speakerGuids: ReadonlyArray<string>,
    kind: string,
    eventGuid: string | null
  ): Promise<Map<string, EmailSends>> {
    const history = new Map<string, EmailSends>(speakerGuids.map((g) => [g, { thisEmail: [], others: [] }]));

    if (speakerGuids.length === 0) {
      return history;
    }

    const rows = await this.sends.find({
      where: { speaker: { guid: In([...speakerGuids]) } },
      relations: { speaker: true },
      order: { created: 'DESC' }
    });

    for (const row of rows) {
      const sends = history.get(row.speaker?.guid);

      if (!sends) {
        continue;
      }

      const at = new Date(row.created).toISOString();

      if (row.kind === kind && (row.eventGuid ?? null) === (eventGuid ?? null)) {
        sends.thisEmail.push(at);
      } else {
        sends.others.push({ kind: row.kind, at });
      }
    }

    return history;
  }

  /** The recipients a preview lists, each with what they were sent before (#3167). */
  public async withSends(
    recipients: Array<EmailRecipient>,
    kind: string,
    eventGuid: string | null
  ): Promise<Array<EmailRecipient>> {
    const history = await this.historyOf(
      recipients.map((r) => r.guid),
      kind,
      eventGuid
    );

    return recipients.map((r) => ({ ...r, sends: history.get(r.guid) }));
  }
}
