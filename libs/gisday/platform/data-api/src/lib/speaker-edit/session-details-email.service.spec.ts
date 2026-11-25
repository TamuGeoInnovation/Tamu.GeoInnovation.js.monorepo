import type { Mock } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SESSION_DETAILS_EMAIL_KIND } from '@tamu-gisc/gisday/common';

import { REPEAT_SEND_MINUTES } from './speaker-edit.service';
import { SpeakerEmailClaim } from '../entities/all.entity';
import { Table } from '../_base/memory-table';
import { RepeatGuard } from './repeat-guard';
import { SessionDetailsEmailService } from './session-details-email.service';

/**
 * #3092: a session's speakers are emailed its details, prefilled from the session, read and edited first in the window the
 * profile email uses, sent several at a time, and never twice to the same speaker for the same session within
 * `REPEAT_SEND_MINUTES` (#3065).
 */
/** The table of sends (#3098), as every copy of the API shares it: each copy's service is given the same one. */
const sendsTable = () => new Table<SpeakerEmailClaim>();

describe('SessionDetailsEmailService', () => {
  const ana = { guid: 'sp-ana', firstName: 'Ana', lastName: 'Ruiz', email: ' ana@example.edu ' };
  const cy = { guid: 'sp-cy', firstName: 'Cy', lastName: 'Diaz', email: 'cy@example.edu' };
  const noAddress = { guid: 'sp-dee', firstName: 'Dee', lastName: 'Fox', email: '' };
  const session = {
    guid: 'e-1',
    name: 'WORKSHOP: Mapping floods',
    mode: 'hybrid',
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300' },
    broadcast: { publicUrl: 'https://zoom.example/j/123', phoneNumber: '+1 555 0100' },
    requirements: 'A laptop.',
    speakers: [ana, cy, noAddress],
    // The season's days, for the email's design on Texas A&M's site (#3114).
    season: { days: ['16', '17', '18', '19', '20'].map((d) => ({ date: `2026-11-${d}T06:00:00.000Z` })) }
  };

  let sent: Array<{ to: string; subject: string; text: string; html: string; from: string }>;
  let events: { findOne: Mock };
  let sends: Table<SpeakerEmailClaim>;
  let contact: { sendMessage: Mock };
  let service: SessionDetailsEmailService;
  let inFlight: number;
  let mostInFlight: number;

  beforeEach(() => {
    sent = [];
    inFlight = 0;
    mostInFlight = 0;
    events = { findOne: vi.fn(async ({ where }) => (where.guid === session.guid ? session : null)) };
    sends = sendsTable();
    contact = {
      sendMessage: vi.fn(async (m) => {
        inFlight++;
        mostInFlight = Math.max(mostInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight--;
        sent.push(m);
      })
    };
    service = new SessionDetailsEmailService(events as never, new RepeatGuard(sends as never), contact as never);
  });

  it("previews the session's email for its speakers with an address, and names those it cannot reach; nothing is sent", async () => {
    const preview = await service.preview('e-1', 'gisday.tamu.edu');

    expect(sent).toEqual([]);
    expect(preview.groups).toHaveLength(1);

    const [group] = preview.groups;

    expect(group.kind).toBe(SESSION_DETAILS_EMAIL_KIND);
    expect(group.count).toBe(2);
    expect(group.subject).toContain('WORKSHOP: Mapping floods');
    // Texas A&M's site: when and where are in the design's details box, said once, not in the text too (#3114).
    expect(group.template).not.toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(group.design?.session?.when).toBe('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(group.template).toContain('https://zoom.example/j/123');
    expect(group.template).toContain('https://gisday.tamu.edu/sessions/details/e-1');
    expect(group.example).toEqual(
      expect.objectContaining({
        title: 'Ana Ruiz',
        to: 'ana@example.edu',
        values: expect.objectContaining({ '{first name}': 'Ana' })
      })
    );
    expect(preview.noAddress).toEqual(['Dee Fox']);
  });

  it('keeps when and where in the text on a site without the design, where nothing else says them (#3114)', async () => {
    const [group] = (await service.preview('e-1', 'gisday.ucgis.org')).groups;

    expect(group.template).toContain('**When:** Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(group.template).toContain('**Where:**');
  });

  it('sends each speaker with an address their own copy, as edited, from the site, as Markdown and HTML', async () => {
    const result = await service.send('e-1', 'gisday.tamu.edu', {
      subject: 'About {site}',
      template: 'Hi **{first name}**'
    });

    expect(result.sent).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect(result.skipped).toEqual([{ name: 'Dee Fox', reason: 'no email address on their record' }]);
    expect(sent.map((m) => m.to).sort()).toEqual(['ana@example.edu', 'cy@example.edu']);
    expect(sent.find((m) => m.to === 'ana@example.edu')).toEqual(
      expect.objectContaining({
        subject: 'About Texas A&M GIS Day',
        text: 'Hi **Ana**',
        html: expect.stringContaining('<strong>Ana</strong>')
      })
    );
  });

  /**
   * #3114: on gisday.tamu.edu the email wears the Texas A&M GIS Day design, with the season's dates, the session in its
   * details box and the sender's sign-off; txgisday.org's stays plain. The plain text goes beside it either way.
   */
  it("sends Texas A&M's speakers the designed email, and txgisday.org's the plain one", async () => {
    await service.send('e-1', 'gisday.tamu.edu', { subject: 'About {site}', template: 'Hi **{first name}**' });
    const tamu = sent.find((m) => m.to === 'ana@example.edu');

    expect(tamu.html).toContain('GIS DAY(S)');
    expect(tamu.html).toContain('November 16–20, 2026');
    expect(tamu.html).toContain('<b>Where:</b> MSC 2300');
    expect(tamu.html).toContain('<strong>Ana</strong>');
    expect(tamu.text).toBe('Hi **Ana**');

    // Another copy of the service, so the repeat guard (#3065) does not skip the same speakers.
    sent = [];
    await new SessionDetailsEmailService(events as never, new RepeatGuard(sendsTable() as never), {
      sendMessage: vi.fn(async (m) => sent.push(m))
    } as never).send('e-1', 'txgisday.org', { subject: 'About {site}', template: 'Hi **{first name}**' });

    expect(sent.find((m) => m.to === 'ana@example.edu').html).not.toContain('GIS DAY(S)');
  });

  it("gives the preview the design, so the window shows the whole email: the season's days and the session", async () => {
    const [group] = (await service.preview('e-1', 'gisday.tamu.edu')).groups;

    expect(group.design).toEqual(
      expect.objectContaining({
        days: expect.arrayContaining(['2026-11-16T06:00:00.000Z', '2026-11-20T06:00:00.000Z']),
        session: expect.objectContaining({ name: 'WORKSHOP: Mapping floods', where: 'MSC 2300, and online' })
      })
    );
  });

  // #3100: as the sender the admin chose in the window, as the controller checked it, with replies to it.
  it('sends as the sender chosen, with replies to it', async () => {
    const chosen = { from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>', replyTo: 'jadmin@tamu.edu' };

    await service.send('e-1', 'gisday.tamu.edu', undefined, chosen);

    expect(sent).toHaveLength(2);
    expect(sent).toEqual([expect.objectContaining(chosen), expect.objectContaining(chosen)]);
  });

  it("sends the session's prefilled email when no edited one is given", async () => {
    await service.send('e-1', 'gisday.tamu.edu');

    expect(sent[0].text).toContain('WORKSHOP: Mapping floods');
    expect(sent[0].text).not.toMatch(/\{[a-z ]+\}/);
  });

  it('sends several at a time, as the profile email does (#3067)', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      guid: `sp-${i}`,
      firstName: `P${i}`,
      lastName: 'X',
      email: `p${i}@example.edu`
    }));

    events.findOne.mockResolvedValueOnce({ ...session, speakers: many });

    const result = await service.send('e-1', 'gisday.tamu.edu');

    expect(result.sent).toHaveLength(12);
    expect(mostInFlight).toBeGreaterThan(1);
  });

  it(`emails no one twice for the same session within ${REPEAT_SEND_MINUTES} minutes, and says why (#3065)`, async () => {
    const [first, again] = await Promise.all([
      service.send('e-1', 'gisday.tamu.edu'),
      service.send('e-1', 'gisday.tamu.edu')
    ]);

    expect(sent).toHaveLength(2);
    expect([...first.sent, ...again.sent].sort()).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect([...first.skipped, ...again.skipped]).toEqual(
      expect.arrayContaining([
        { name: 'Ana Ruiz', reason: `already emailed this session's details in the last ${REPEAT_SEND_MINUTES} minutes` }
      ])
    );

    const later = await service.send('e-1', 'gisday.tamu.edu');

    expect(later.sent).toEqual([]);
    expect(sent).toHaveLength(2);
  });

  /**
   * #3098: production runs two copies of the API. A guard kept in one copy's memory let a repeat that reached the other
   * copy email everyone again; the sends are now recorded in a table both copies share.
   */
  it('emails no one twice when the repeat reaches the other copy of the API (#3098)', async () => {
    const otherCopy = new SessionDetailsEmailService(events as never, new RepeatGuard(sends as never), contact as never);

    const [first, again] = await Promise.all([
      service.send('e-1', 'gisday.tamu.edu'),
      otherCopy.send('e-1', 'gisday.tamu.edu')
    ]);

    expect(sent).toHaveLength(2);
    expect([...first.sent, ...again.sent].sort()).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect((await otherCopy.send('e-1', 'gisday.tamu.edu')).sent).toEqual([]);
    expect(sent).toHaveLength(2);
  });

  it('records each send before it goes: the session, the speaker and when (#3098)', async () => {
    await service.send('e-1', 'gisday.tamu.edu');

    expect(sends.rows.map((r) => [r.session.guid, r.speaker.guid]).sort()).toEqual([
      ['e-1', 'sp-ana'],
      ['e-1', 'sp-cy']
    ]);
    expect(sends.rows.every((r) => r.created instanceof Date)).toBe(true);
  });

  it(`emails them again after ${REPEAT_SEND_MINUTES} minutes`, async () => {
    const now = vi.spyOn(Date, 'now');

    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z'));
    await service.send('e-1', 'gisday.tamu.edu');
    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z') + REPEAT_SEND_MINUTES * 60 * 1000 + 1);
    const again = await service.send('e-1', 'gisday.tamu.edu');
    now.mockRestore();

    expect(again.sent).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect(sent).toHaveLength(4);
  });

  it('lets a speaker whose email failed be sent again at once, and says it failed', async () => {
    const failingContact = {
      sendMessage: vi.fn().mockRejectedValueOnce(new Error('mailroom down')).mockResolvedValue({})
    };
    const failing = new SessionDetailsEmailService(
      events as never,
      new RepeatGuard(sendsTable() as never),
      failingContact as never
    );

    events.findOne.mockResolvedValue({ ...session, speakers: [ana] });

    expect(await failing.send('e-1', 'gisday.tamu.edu')).toEqual({
      sent: [],
      skipped: [{ name: 'Ana Ruiz', reason: 'the email could not be sent' }]
    });
    expect((await failing.send('e-1', 'gisday.tamu.edu')).sent).toEqual(['Ana Ruiz']);
  });

  it('refuses an edited email with no subject or text, and sends nothing', async () => {
    await expect(service.send('e-1', 'gisday.tamu.edu', { subject: ' ', template: 'Hi' })).rejects.toThrow(
      BadRequestException
    );
    expect(sent).toEqual([]);
  });

  it('refuses a session that does not exist, or none named', async () => {
    await expect(service.preview('nope', 'gisday.tamu.edu')).rejects.toThrow(NotFoundException);
    await expect(service.send(undefined as never, 'gisday.tamu.edu')).rejects.toThrow(BadRequestException);
    expect(sent).toEqual([]);
  });
});

/** #3104: which of the session's speakers get it, and one email to them all together or a copy each. */
describe('SessionDetailsEmailService, choosing speakers', () => {
  const sharmin = { guid: 'sp-sh', firstName: 'Sharmin', lastName: 'Example', email: 'sharmin@example.com' };
  const colby = { guid: 'sp-co', firstName: 'Colby', lastName: 'Sample', email: ' colby@example.com ' };
  const cara = { guid: 'sp-ca', firstName: 'Cara', lastName: 'Test', email: 'cara@example.com' };
  const noAddress = { guid: 'sp-nd', firstName: 'Dee', lastName: 'Fox', email: '' };
  const session = {
    guid: 'e-2',
    name: 'Made-up hybrid session',
    mode: 'hybrid',
    day: null,
    location: null,
    broadcast: { publicUrl: 'https://zoom.example/j/9' },
    speakers: [sharmin, colby, cara, noAddress]
  };
  const together = 'Howdy {first name},\n\nSee you at {site}.';

  let sent: Array<{ to: string; subject: string; text: string }>;
  let sends: Table<SpeakerEmailClaim>;
  let service: SessionDetailsEmailService;

  beforeEach(() => {
    sent = [];
    sends = new Table<SpeakerEmailClaim>();
    service = new SessionDetailsEmailService(
      { findOne: vi.fn(async ({ where }) => (where.guid === session.guid ? session : null)) } as never,
      new RepeatGuard(sends as never),
      { sendMessage: vi.fn(async (m) => sent.push(m)) } as never
    );
  });

  it('lists each speaker it can reach, with their address, for the tick boxes', async () => {
    const preview = await service.preview('e-2', 'gisday.tamu.edu');

    expect(preview.recipients).toEqual([
      { guid: 'sp-sh', name: 'Sharmin Example', firstName: 'Sharmin', email: 'sharmin@example.com' },
      { guid: 'sp-co', name: 'Colby Sample', firstName: 'Colby', email: 'colby@example.com' },
      { guid: 'sp-ca', name: 'Cara Test', firstName: 'Cara', email: 'cara@example.com' }
    ]);
    // The session details email may go together: nothing in it is one speaker's own.
    expect(preview.copyEachReason).toBeUndefined();
    expect(preview.noAddress).toEqual(['Dee Fox']);
  });

  it('sends one email with every chosen speaker on To, greeting them all by first name', async () => {
    const result = await service.send(
      'e-2',
      'gisday.tamu.edu',
      { subject: 'Your {site} session', template: together },
      undefined,
      { speakers: ['sp-sh', 'sp-co'], together: true }
    );

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('sharmin@example.com, colby@example.com');
    expect(sent[0].text).toBe('Howdy Sharmin and Colby,\n\nSee you at Texas A&M GIS Day.');
    expect(result).toEqual({ sent: ['Sharmin Example and Colby Sample'], skipped: [] });
  });

  it('names three or more as "A, B and C"', async () => {
    await service.send('e-2', 'gisday.tamu.edu', { subject: 'S', template: together }, undefined, {
      speakers: ['sp-sh', 'sp-co', 'sp-ca'],
      together: true
    });

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('sharmin@example.com, colby@example.com, cara@example.com');
    expect(sent[0].text).toContain('Howdy Sharmin, Colby and Cara,');
  });

  it('sends a copy each to the chosen speakers only, and nothing to those not chosen', async () => {
    const result = await service.send('e-2', 'gisday.tamu.edu', { subject: 'S', template: together }, undefined, {
      speakers: ['sp-sh', 'sp-ca']
    });

    expect(sent.map((m) => m.to).sort()).toEqual(['cara@example.com', 'sharmin@example.com']);
    expect(sent.find((m) => m.to === 'cara@example.com').text).toContain('Howdy Cara,');
    expect(result.sent.sort()).toEqual(['Cara Test', 'Sharmin Example']);
    // Only those chosen: the one with no address was not, so is not reported either.
    expect(result.skipped).toEqual([]);
  });

  it('sends one chosen speaker their own copy, together or not', async () => {
    await service.send('e-2', 'gisday.tamu.edu', { subject: 'S', template: together }, undefined, {
      speakers: ['sp-co'],
      together: true
    });

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('colby@example.com');
    expect(sent[0].text).toContain('Howdy Colby,');
  });

  it("ignores a chosen id that is not one of the session's speakers, and refuses a choice of no one", async () => {
    await service.send('e-2', 'gisday.tamu.edu', undefined, undefined, {
      speakers: ['sp-sh', 'someone-else'],
      together: true
    });

    expect(sent.map((m) => m.to)).toEqual(['sharmin@example.com']);

    await expect(service.send('e-2', 'gisday.tamu.edu', undefined, undefined, { speakers: [] })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.send('e-2', 'gisday.tamu.edu', undefined, undefined, { speakers: 'sp-sh' as never })
    ).rejects.toThrow(BadRequestException);
    expect(sent).toHaveLength(1);
  });

  it(`counts a together send once, for its whole group, within ${REPEAT_SEND_MINUTES} minutes`, async () => {
    const choice = { speakers: ['sp-sh', 'sp-co', 'sp-ca'], together: true };
    const [first, again] = await Promise.all([
      service.send('e-2', 'gisday.tamu.edu', undefined, undefined, choice),
      service.send('e-2', 'gisday.tamu.edu', undefined, undefined, choice)
    ]);

    // One email, not three, and the repeat skipped as one, naming the group, rather than three times.
    expect(sent).toHaveLength(1);
    expect([...first.sent, ...again.sent]).toEqual(['Sharmin Example, Colby Sample and Cara Test']);
    expect([...first.skipped, ...again.skipped]).toEqual([
      {
        name: 'Sharmin Example, Colby Sample and Cara Test',
        reason: `already emailed this session's details in the last ${REPEAT_SEND_MINUTES} minutes`
      }
    ]);

    // Each of the group was emailed, so a copy each to one of them is a repeat too. A second later: made in the same
    // millisecond as the group's, its claim was told apart by a random guid and won half of those ties (#1977).
    vi.useFakeTimers({ toFake: ['Date'], now: Date.now() + 1_000 });

    let copy: Awaited<ReturnType<typeof service.send>>;

    try {
      copy = await service.send('e-2', 'gisday.tamu.edu', undefined, undefined, { speakers: ['sp-co'] });
    } finally {
      vi.useRealTimers();
    }

    expect(copy.sent).toEqual([]);
    expect(sent).toHaveLength(1);
  });

  it('emails a together group once when the repeat reaches the other copy of the API (#3098)', async () => {
    const otherCopy = new SessionDetailsEmailService(
      { findOne: vi.fn(async ({ where }) => (where.guid === session.guid ? session : null)) } as never,
      new RepeatGuard(sends as never),
      { sendMessage: vi.fn(async (m) => sent.push(m)) } as never
    );
    const choice = { speakers: ['sp-sh', 'sp-co'], together: true };

    await Promise.all([
      service.send('e-2', 'gisday.tamu.edu', { subject: 'S', template: together }, undefined, choice),
      otherCopy.send('e-2', 'gisday.tamu.edu', { subject: 'S', template: together }, undefined, choice)
    ]);

    expect(sent).toHaveLength(1);
    expect(sends.rows.map((r) => r.speaker.guid).sort()).toEqual(['sp-co', 'sp-sh']);
  });

  it('lets a together email that failed be sent again at once', async () => {
    const contact = { sendMessage: vi.fn().mockRejectedValueOnce(new Error('mailroom down')).mockResolvedValue({}) };
    const failing = new SessionDetailsEmailService(
      { findOne: vi.fn(async () => session) } as never,
      new RepeatGuard(new Table<SpeakerEmailClaim>() as never),
      contact as never
    );
    const choice = { speakers: ['sp-sh', 'sp-co'], together: true };

    expect(await failing.send('e-2', 'gisday.tamu.edu', undefined, undefined, choice)).toEqual({
      sent: [],
      skipped: [{ name: 'Sharmin Example and Colby Sample', reason: 'the email could not be sent' }]
    });
    expect((await failing.send('e-2', 'gisday.tamu.edu', undefined, undefined, choice)).sent).toEqual([
      'Sharmin Example and Colby Sample'
    ]);
    expect(contact.sendMessage).toHaveBeenCalledTimes(2);
  });
});
