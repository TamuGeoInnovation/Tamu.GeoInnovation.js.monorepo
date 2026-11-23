import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { SpeakerEmailClaim } from '../entities/all.entity';
import { REPEAT_SEND_MINUTES } from './speaker-edit.service';

/**
 * The repeat guard of a session's speaker emails (#3065, #3098, #3260): the session details, Ask for slides and Ask to
 * judge emails each go to one speaker for one session at most once within `REPEAT_SEND_MINUTES`. Each send is claimed in
 * `speaker_email_claims` before it goes, and every copy of the API shares that table, so a repeat is caught whichever copy
 * it reaches. Production runs two; a guard kept in each copy's memory caught only a repeat that reached the same one.
 */
@Injectable()
export class RepeatGuard {
  constructor(@InjectRepository(SpeakerEmailClaim) private readonly claims: Repository<SpeakerEmailClaim>) {}

  /**
   * Claims `speakers` as sent the `kind` email about `sessionGuid` now, then checks: the claim stands only if each of its
   * rows is the earliest for its speaker in the last `REPEAT_SEND_MINUTES`. Two sends racing each record theirs and then
   * agree which came first, so exactly one goes. Answers the claim, or null, having removed it, for a repeat. Several
   * speakers are one claim, for an email to them together: a repeat if any of them was sent it just now.
   *
   * Every row of one claim has the claim's time and an id starting with the claim's, so two claims are ordered the same
   * way for every speaker they share. With an id of their own, two together emails sent at the same instant each lost on
   * a different speaker, and neither went (#3098).
   */
  public async claim(
    kind: string,
    sessionGuid: string,
    speakers: Array<{ guid: string }>
  ): Promise<Array<SpeakerEmailClaim> | null> {
    const claim = crypto.randomUUID();
    const created = new Date(Date.now());
    const rows = await this.claims.save(
      speakers.map((speaker, i) =>
        this.claims.create({
          guid: `${claim}-${i}`,
          created,
          kind,
          session: { guid: sessionGuid },
          speaker: { guid: speaker.guid }
        })
      )
    );
    const since = new Date(Date.now() - REPEAT_SEND_MINUTES * 60 * 1000);

    for (const row of rows) {
      const recent = await this.claims.find({
        where: { kind, session: { guid: sessionGuid }, speaker: { guid: row.speaker.guid }, created: MoreThan(since) }
      });

      if (firstOf([...recent, row]).guid !== row.guid) {
        await this.release(rows);

        return null;
      }
    }

    return rows;
  }

  /** Removes a claim, for an email that was a repeat or could not be sent: not sent, so the admin may try again at once. */
  public async release(claim: Array<SpeakerEmailClaim>): Promise<void> {
    await this.claims.delete(claim.map((row) => row.guid));
  }
}

/** The earliest of some claims: by when, then by id, so every copy of the API picks the same one. */
function firstOf(rows: Array<Pick<SpeakerEmailClaim, 'guid' | 'created'>>): Pick<SpeakerEmailClaim, 'guid' | 'created'> {
  return [...rows].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime() || a.guid.localeCompare(b.guid)
  )[0];
}
