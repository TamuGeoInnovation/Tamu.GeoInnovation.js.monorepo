import { BadRequestException } from '@nestjs/common';

import { JUDGING_COPY_EACH, JUDGING_EMAIL_KIND, JUDGING_LINK_PREVIEW } from '@tamu-gisc/gisday/common';

import { JudgingEmailService } from './judging-email.service';

/**
 * #3183: a session's judges asked to judge its competition. Prefilled from the session and its competition, previewed with
 * a stand-in for the link, then sent a copy each to the session's judges only, each with their own judging link, never
 * the presenter's edit link (decided 3B), and recorded as kind `judging`.
 */
describe('JudgingEmailService (#3183)', () => {
  // Made-up people and session.
  const dana = { guid: 'sp-da', firstName: 'Dana', lastName: 'Judge', email: ' dana@example.com ' };
  const emery = { guid: 'sp-em', firstName: 'Emery', lastName: 'Judge', email: 'emery@example.com' };
  const noAddress = { guid: 'sp-nd', firstName: 'Dee', lastName: 'Fox', email: '' };
  const presenter = { guid: 'sp-pr', firstName: 'Avery', lastName: 'Example', email: 'avery@example.com' };
  const session = {
    guid: 'e-1',
    name: 'Made-up poster session',
    mode: 'in-person',
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300' },
    speakers: [dana, emery, noAddress, presenter],
    judgedCompetition: 'graduate-poster' as string | null,
    season: { days: [{ date: '2026-11-19T06:00:00.000Z' }] }
  };

  let judges: Array<typeof dana>;
  let sent: Array<{ to: string; subject: string; text: string }>;
  let events: { findOne: jest.Mock };
  let links: { newLink: jest.Mock };
  let log: { record: jest.Mock; withSends: jest.Mock };
  let service: JudgingEmailService;

  beforeEach(() => {
    sent = [];
    judges = [dana, emery, noAddress];
    session.judgedCompetition = 'graduate-poster';
    events = {
      findOne: jest.fn(async ({ where, relations }) =>
        where.guid !== session.guid ? null : relations?.judges ? { ...session, judges } : session
      )
    };
    links = {
      newLink: jest.fn(async (speaker: { guid: string }, _host: string, purpose: string) => ({
        url: `https://gisday.tamu.edu/${purpose === 'judging' ? 'judging' : 'presenters/edit'}/LINK-OF-${speaker.guid}`,
        expires: new Date('2026-11-22T18:00:00Z')
      }))
    };
    log = { record: jest.fn(async () => undefined), withSends: jest.fn(async (r) => r) };
    service = new JudgingEmailService(
      events as never,
      { sendMessage: jest.fn(async (m) => sent.push(m)) } as never,
      links as never,
      log as never
    );
  });

  it('previews it for the judges with an address, never the other speakers, with a stand-in for the link', async () => {
    const preview = await service.preview('e-1', 'example.org');
    const [group] = preview.groups;

    expect(sent).toEqual([]);
    expect(links.newLink).not.toHaveBeenCalled();
    expect(group.kind).toBe(JUDGING_EMAIL_KIND);
    expect(group.count).toBe(2);
    expect(group.subject).toBe('Judging the graduate poster competition at {site}');
    expect(group.template).toContain('**Made-up poster session**');
    expect(group.example.values['{judging link}']).toBe(JUDGING_LINK_PREVIEW);
    // A judge's header, not a presenter's: "YOUR JUDGING", not "YOUR SESSION".
    expect(group.design.label).toBe('Your judging');
    expect(group.design.why).toMatch(/because you are judging at/);
    expect(preview.recipients.map((r) => r.guid)).toEqual(['sp-da', 'sp-em']);
    expect(log.withSends).toHaveBeenCalledWith(expect.any(Array), JUDGING_EMAIL_KIND, 'e-1');
    expect(preview.copyEachReason).toBe(JUDGING_COPY_EACH);
    expect(preview.noAddress).toEqual(['Dee Fox']);
  });

  it('sends each judge their own copy with their own judging link, and records it as an Ask to judge email', async () => {
    const result = await service.send('e-1', 'example.org');

    expect(result.sent).toEqual(['Dana Judge', 'Emery Judge']);
    expect(result.skipped).toEqual([{ name: 'Dee Fox', reason: 'no email address on their record' }]);
    expect(links.newLink).toHaveBeenCalledWith(expect.objectContaining({ guid: 'sp-da' }), 'example.org', 'judging');
    expect(sent.map((m) => m.to)).toEqual(['dana@example.com', 'emery@example.com']);

    const toDana = sent.find((m) => m.to === 'dana@example.com');

    expect(toDana.text).toContain('/judging/LINK-OF-sp-da');
    expect(toDana.text).not.toContain('LINK-OF-sp-em');
    expect(toDana.text).not.toContain('presenters/edit');
    expect(toDana.text).not.toMatch(/\{[a-z ]+\}/);
    expect(sent.some((m) => m.to === 'avery@example.com')).toBe(false);
    expect(log.record.mock.calls.map(([who, kind, session]) => [who.map((w) => w.guid), kind, session])).toEqual([
      [['sp-da'], JUDGING_EMAIL_KIND, 'e-1'],
      [['sp-em'], JUDGING_EMAIL_KIND, 'e-1']
    ]);
  });

  it('sends only to the judges ticked, and refuses a ticked speaker who is not a judge', async () => {
    const result = await service.send('e-1', 'example.org', undefined, undefined, ['sp-em']);

    expect(result.sent).toEqual(['Emery Judge']);
    await expect(service.send('e-1', 'example.org', undefined, undefined, ['sp-pr'])).rejects.toThrow(
      'None of the speakers chosen is a judge of this session with an email address.'
    );
  });

  it('never asks one judge twice for one session within a few minutes', async () => {
    await service.send('e-1', 'example.org');
    const again = await service.send('e-1', 'example.org', undefined, undefined, ['sp-da']);

    expect(again.sent).toEqual([]);
    expect(again.skipped[0].reason).toMatch(/already asked to judge this session/);
  });

  it('asks each judge once when the repeat reaches the other copy of the API (#3260)', async () => {
    // Production runs two copies of the API, and a repeated send may reach either.
    const copy = () =>
      new JudgingEmailService(
        events as never,
        { sendMessage: jest.fn(async (m) => sent.push(m)) } as never,
        links as never,
        log as never
      );
    const [first, again] = await Promise.all([copy().send('e-1', 'example.org'), copy().send('e-1', 'example.org')]);
    const repeats = [...first.skipped, ...again.skipped].filter((s) => /already asked/.test(s.reason));

    expect(sent.map((m) => m.to.trim()).sort()).toEqual(['dana@example.com', 'emery@example.com']);
    expect(repeats.map((s) => s.name).sort()).toEqual(['Dana Judge', 'Emery Judge']);
  });

  it('refuses a session that judges no competition, or has no judges, and sends nothing', async () => {
    session.judgedCompetition = null;
    await expect(service.preview('e-1')).rejects.toThrow('This session judges no competition');

    session.judgedCompetition = 'graduate-poster';
    judges = [];
    await expect(service.send('e-1')).rejects.toThrow('This session has no judges');
    expect(sent).toEqual([]);
    expect(links.newLink).not.toHaveBeenCalled();
  });

  it('refuses an edited email that drops the judging link', async () => {
    await expect(service.send('e-1', 'example.org', { subject: 'S', template: 'No link here' })).rejects.toThrow(
      BadRequestException
    );
    expect(sent).toEqual([]);
  });
});
