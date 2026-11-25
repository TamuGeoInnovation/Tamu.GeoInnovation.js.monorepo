import {
  PROFILE_EMAIL_KIND,
  SESSION_DETAILS_EMAIL_KIND,
  SLIDES_REQUEST_EMAIL_KIND
} from '@tamu-gisc/gisday/common';

import { EmailSendLog } from './email-send-log';
import { SpeakerEditModule } from './speaker-edit.module';
import { SpeakerEditService } from './speaker-edit.service';
import { Table } from '../_base/memory-table';
import { SpeakerEmailClaim } from '../entities/all.entity';
import { RepeatGuard } from './repeat-guard';
import { SessionDetailsEmailService } from './session-details-email.service';
import { SlidesRequestEmailService } from './slides-request-email.service';

/**
 * #3167: the maintainer could not tell who had already been emailed. Every email the site sends a speaker is recorded,
 * one row per speaker it went to, and each email's preview says, for each speaker, when they were sent that email
 * before and what else they were sent. Made-up speakers and sessions only.
 */

type Row = {
  speaker: { guid: string };
  kind: string;
  eventGuid: string | null;
  sentTo: string | null;
  sentFrom: string | null;
  created: Date;
};

/** The table, in memory: rows saved in order, each a second after the last, read back newest first. */
function sendsTable() {
  const rows: Array<Row> = [];
  let clock = Date.parse('2026-11-16T20:00:00Z');

  return {
    rows,
    create: (x: Omit<Row, 'created'>) => ({ ...x }),
    save: vi.fn(async (xs: Array<Omit<Row, 'created'>>) => {
      for (const x of xs) {
        clock += 1000;
        rows.push({ ...x, created: new Date(clock) });
      }

      return xs;
    }),
    find: vi.fn(async ({ where }) =>
      rows
        .filter((r) => where.speaker.guid._value.includes(r.speaker.guid))
        .sort((a, b) => b.created.getTime() - a.created.getTime())
    )
  };
}

const avery = { guid: 'sp-av', firstName: 'Avery', lastName: 'Example', email: ' avery@example.com ' };
const blair = { guid: 'sp-bl', firstName: 'Blair', lastName: 'Sample', email: 'blair@example.com' };
const noAddress = { guid: 'sp-nd', firstName: 'Dee', lastName: 'Fox', email: '' };
const days = { days: ['16', '17', '18', '19', '20'].map((d) => ({ date: `2026-11-${d}T06:00:00.000Z` })) };

function sessionNamed(guid: string) {
  return {
    guid,
    name: `Made-up session ${guid}`,
    mode: 'hybrid',
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300' },
    speakers: [avery, blair, noAddress],
    season: days
  };
}

describe('EmailSendLog (#3167)', () => {
  let table: ReturnType<typeof sendsTable>;
  let log: EmailSendLog;

  beforeEach(() => {
    table = sendsTable();
    log = new EmailSendLog(table as never);
  });

  it('records one row per speaker, with the email, the session, the address and who it was from', async () => {
    await log.record([avery, blair], SESSION_DETAILS_EMAIL_KIND, 'e-1', 'GIS Day <gisday@example.com>');

    expect(table.rows.map(({ created, ...r }) => r)).toEqual([
      {
        speaker: { guid: 'sp-av' },
        kind: SESSION_DETAILS_EMAIL_KIND,
        eventGuid: 'e-1',
        sentTo: 'avery@example.com',
        sentFrom: 'GIS Day <gisday@example.com>'
      },
      {
        speaker: { guid: 'sp-bl' },
        kind: SESSION_DETAILS_EMAIL_KIND,
        eventGuid: 'e-1',
        sentTo: 'blair@example.com',
        sentFrom: 'GIS Day <gisday@example.com>'
      }
    ]);
  });

  it('never fails a send it cannot record: the email has already gone', async () => {
    table.save.mockRejectedValueOnce(new Error('the database is away'));

    await expect(log.record([avery], PROFILE_EMAIL_KIND, null)).resolves.toBeUndefined();
  });

  it("gives each speaker this email's sends, for this session only, newest first, and every other email apart", async () => {
    await log.record([avery], SESSION_DETAILS_EMAIL_KIND, 'e-1');
    await log.record([avery], PROFILE_EMAIL_KIND, null);
    await log.record([avery], SESSION_DETAILS_EMAIL_KIND, 'e-2');
    await log.record([avery], SESSION_DETAILS_EMAIL_KIND, 'e-1');

    const history = await log.historyOf(['sp-av', 'sp-bl'], SESSION_DETAILS_EMAIL_KIND, 'e-1');

    expect(history.get('sp-av')).toEqual({
      thisEmail: ['2026-11-16T20:00:04.000Z', '2026-11-16T20:00:01.000Z'],
      others: [
        { kind: SESSION_DETAILS_EMAIL_KIND, at: '2026-11-16T20:00:03.000Z' },
        { kind: PROFILE_EMAIL_KIND, at: '2026-11-16T20:00:02.000Z' }
      ]
    });
    // Never sent anything: listed, with nothing.
    expect(history.get('sp-bl')).toEqual({ thisEmail: [], others: [] });
  });

  it('is provided where the speaker emails are, so every send can write it', () => {
    expect(Reflect.getMetadata('providers', SpeakerEditModule)).toContain(EmailSendLog);
  });
});

describe('every speaker email records what it sent, and its preview shows it (#3167)', () => {
  let table: ReturnType<typeof sendsTable>;
  let log: EmailSendLog;
  let sent: Array<{ to: string }>;
  const contact = () => ({ sendMessage: vi.fn(async (m) => sent.push(m)) });
  const sessions = { 'e-1': sessionNamed('e-1'), 'e-2': sessionNamed('e-2') };
  const events = { findOne: vi.fn(async ({ where }) => sessions[where.guid] ?? null) };

  beforeEach(() => {
    table = sendsTable();
    log = new EmailSendLog(table as never);
    sent = [];
  });

  function profileEmails() {
    const links = [];

    return new SpeakerEditService(
      {
        create: (x) => x,
        save: vi.fn(async (x) => links.push({ ...x, created: new Date() })),
        count: vi.fn(async () => 0),
        // No other profile link of the last few minutes, so each send's own link stands (#3326).
        find: vi.fn(async () => []),
        delete: vi.fn()
      } as never,
      {} as never,
      {
        find: vi.fn(async ({ where }) =>
          [avery, blair, noAddress]
            .filter((s) => where.guid._value.includes(s.guid))
            .map((s) => ({ ...s, season: days }))
        )
      } as never,
      {} as never,
      {} as never,
      contact() as never,
      {} as never,
      {} as never,
      log
    );
  }

  it('records each profile email sent, to that speaker, and none for one with no address', async () => {
    await profileEmails().sendLinks(['sp-av', 'sp-nd'], 'gisday.tamu.edu');

    expect(sent).toHaveLength(1);
    expect(table.rows.map((r) => [r.speaker.guid, r.kind, r.eventGuid, r.sentTo])).toEqual([
      ['sp-av', PROFILE_EMAIL_KIND, null, 'avery@example.com']
    ]);
  });

  it("shows in the profile email's preview who was sent it, and who was not", async () => {
    const service = profileEmails();

    await service.sendLinks(['sp-av'], 'gisday.tamu.edu');

    const preview = await service.previewLinks(['sp-av', 'sp-bl'], 'gisday.tamu.edu');

    expect(preview.recipients.map((r) => [r.guid, r.sends.thisEmail.length])).toEqual([
      ['sp-av', 1],
      ['sp-bl', 0]
    ]);
  });

  it("records a session's details sent together once for each speaker on it, about that session", async () => {
    const service = new SessionDetailsEmailService(events as never, new RepeatGuard(new Table<SpeakerEmailClaim>() as never), contact() as never, log);

    await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, { speakers: ['sp-av', 'sp-bl'], together: true });

    expect(sent).toHaveLength(1);
    expect(table.rows.map((r) => [r.speaker.guid, r.kind, r.eventGuid])).toEqual([
      ['sp-av', SESSION_DETAILS_EMAIL_KIND, 'e-1'],
      ['sp-bl', SESSION_DETAILS_EMAIL_KIND, 'e-1']
    ]);

    // This session's preview counts it; another session's does not, but lists it among the other emails.
    const here = await service.preview('e-1', 'gisday.tamu.edu');
    const there = await service.preview('e-2', 'gisday.tamu.edu');

    expect(here.recipients.map((r) => r.sends.thisEmail.length)).toEqual([1, 1]);
    expect(there.recipients.map((r) => [r.sends.thisEmail.length, r.sends.others.length])).toEqual([
      [0, 1],
      [0, 1]
    ]);
  });

  it('records each Ask for slides email sent, about that session', async () => {
    const links = {
      newLink: vi.fn(async (s: { guid: string }) => ({
        url: `https://gisday.tamu.edu/presenters/edit/LINK-OF-${s.guid}`,
        expires: new Date('2026-11-22T18:00:00Z')
      }))
    };
    const service = new SlidesRequestEmailService(events as never, new RepeatGuard(new Table<SpeakerEmailClaim>() as never), contact() as never, links as never, log);

    await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-bl']);

    expect(table.rows.map((r) => [r.speaker.guid, r.kind, r.eventGuid])).toEqual([
      ['sp-bl', SLIDES_REQUEST_EMAIL_KIND, 'e-1']
    ]);

    const preview = await service.preview('e-1', 'gisday.tamu.edu');

    expect(preview.recipients.map((r) => [r.guid, r.sends.thisEmail.length])).toEqual([
      ['sp-av', 0],
      ['sp-bl', 1]
    ]);
  });

  it('records nothing for an email that could not be sent', async () => {
    const failing = new SessionDetailsEmailService(
      events as never,
      new RepeatGuard(new Table<SpeakerEmailClaim>() as never),
      { sendMessage: vi.fn(async () => Promise.reject(new Error('the mail server is away'))) } as never,
      log
    );

    await failing.send('e-1', 'gisday.tamu.edu', undefined, undefined, { speakers: ['sp-av'] });

    expect(table.rows).toEqual([]);
  });
});
