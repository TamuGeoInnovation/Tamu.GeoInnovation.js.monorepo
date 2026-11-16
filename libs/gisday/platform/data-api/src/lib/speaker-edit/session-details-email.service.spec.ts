import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SESSION_DETAILS_EMAIL_KIND } from '@tamu-gisc/gisday/common';

import { REPEAT_SEND_MINUTES } from './speaker-edit.service';
import { SessionDetailsEmailService } from './session-details-email.service';

/**
 * #3092: a session's speakers are emailed its details, prefilled from the session, read and edited first in the window the
 * profile email uses, sent several at a time, and never twice to the same speaker for the same session within
 * `REPEAT_SEND_MINUTES` (#3065).
 */
/**
 * The table of sends (#3098), as every copy of the API shares it: each copy's service is given the same one. A row has
 * the session, the speaker, who sent it and when.
 */
function sendsTable() {
  const rows: Array<{ guid: string; session: { guid: string }; speaker: { guid: string }; sentBy: string | null; created: Date }> = [];
  let next = 0;

  return {
    rows,
    create: (row: object) => row,
    save: jest.fn(async (row: { session: { guid: string }; speaker: { guid: string }; sentBy: string | null }) => {
      const saved = { ...row, guid: `send-${String(++next).padStart(6, '0')}`, created: new Date(Date.now()) };

      rows.push(saved);

      return saved;
    }),
    find: jest.fn(async ({ where }) =>
      rows.filter(
        (r) => r.session.guid === where.session.guid && r.speaker.guid === where.speaker.guid && r.created > where.created._value
      )
    ),
    delete: jest.fn(async ({ guid }) => {
      const at = rows.findIndex((r) => r.guid === guid);

      if (at >= 0) {
        rows.splice(at, 1);
      }
    })
  };
}

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
    speakers: [ana, cy, noAddress]
  };

  let sent: Array<{ to: string; subject: string; text: string; html: string; from: string }>;
  let events: { findOne: jest.Mock };
  let sends: ReturnType<typeof sendsTable>;
  let contact: { sendMessage: jest.Mock };
  let service: SessionDetailsEmailService;
  let inFlight: number;
  let mostInFlight: number;

  beforeEach(() => {
    sent = [];
    inFlight = 0;
    mostInFlight = 0;
    events = { findOne: jest.fn(async ({ where }) => (where.guid === session.guid ? session : null)) };
    sends = sendsTable();
    contact = {
      sendMessage: jest.fn(async (m) => {
        inFlight++;
        mostInFlight = Math.max(mostInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight--;
        sent.push(m);
      })
    };
    service = new SessionDetailsEmailService(events as never, sends as never, contact as never);
  });

  it("previews the session's email for its speakers with an address, and names those it cannot reach; nothing is sent", async () => {
    const preview = await service.preview('e-1', 'gisday.tamu.edu');

    expect(sent).toEqual([]);
    expect(preview.groups).toHaveLength(1);

    const [group] = preview.groups;

    expect(group.kind).toBe(SESSION_DETAILS_EMAIL_KIND);
    expect(group.count).toBe(2);
    expect(group.subject).toContain('WORKSHOP: Mapping floods');
    expect(group.template).toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
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
    const otherCopy = new SessionDetailsEmailService(events as never, sends as never, contact as never);

    const [first, again] = await Promise.all([
      service.send('e-1', 'gisday.tamu.edu', undefined, 'auth0|admin'),
      otherCopy.send('e-1', 'gisday.tamu.edu', undefined, 'auth0|admin')
    ]);

    expect(sent).toHaveLength(2);
    expect([...first.sent, ...again.sent].sort()).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect((await otherCopy.send('e-1', 'gisday.tamu.edu')).sent).toEqual([]);
    expect(sent).toHaveLength(2);
  });

  it('records each send: the session, the speaker, who sent it and when (#3098)', async () => {
    await service.send('e-1', 'gisday.tamu.edu', undefined, 'auth0|admin');

    expect(sends.rows.map((r) => [r.session.guid, r.speaker.guid, r.sentBy]).sort()).toEqual([
      ['e-1', 'sp-ana', 'auth0|admin'],
      ['e-1', 'sp-cy', 'auth0|admin']
    ]);
    expect(sends.rows.every((r) => r.created instanceof Date)).toBe(true);
  });

  it(`emails them again after ${REPEAT_SEND_MINUTES} minutes`, async () => {
    const now = jest.spyOn(Date, 'now');

    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z'));
    await service.send('e-1', 'gisday.tamu.edu');
    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z') + REPEAT_SEND_MINUTES * 60 * 1000 + 1);
    const again = await service.send('e-1', 'gisday.tamu.edu');
    now.mockRestore();

    expect(again.sent).toEqual(['Ana Ruiz', 'Cy Diaz']);
    expect(sent).toHaveLength(4);
  });

  it('lets a speaker whose email failed be sent again at once, and says it failed', async () => {
    const failingContact = { sendMessage: jest.fn().mockRejectedValueOnce(new Error('mailroom down')).mockResolvedValue({}) };
    const failing = new SessionDetailsEmailService(events as never, sendsTable() as never, failingContact as never);

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
