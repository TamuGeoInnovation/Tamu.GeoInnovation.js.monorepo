import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  PROFILE_EDIT_LINK_PREVIEW,
  SESSION_FILES_RULE,
  SLIDES_REQUEST_COPY_EACH,
  SLIDES_REQUEST_EMAIL_KIND
} from '@tamu-gisc/gisday/common';

import { REPEAT_SEND_MINUTES } from './speaker-edit.service';
import { SlidesRequestEmailService } from './slides-request-email.service';

/**
 * #3113: a session's speakers asked for their slides. Prefilled from the session, previewed with a stand-in for the link,
 * then sent a copy each, each with that speaker's own edit link, made as the profile email makes them; never twice to one
 * speaker for the same session within `REPEAT_SEND_MINUTES` (#3065), several at a time (#3067).
 */
describe('SlidesRequestEmailService', () => {
  // Made-up speakers and session.
  const avery = { guid: 'sp-av', firstName: 'Avery', lastName: 'Example', email: ' avery@example.com ' };
  const blair = { guid: 'sp-bl', firstName: 'Blair', lastName: 'Sample', email: 'blair@example.com' };
  const noAddress = { guid: 'sp-nd', firstName: 'Dee', lastName: 'Fox', email: '' };
  const session = {
    guid: 'e-1',
    name: 'Made-up hybrid session',
    mode: 'hybrid',
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300' },
    speakers: [avery, blair, noAddress],
    // The season's days, for the email's design on Texas A&M's site (#3126).
    season: { days: ['16', '17', '18', '19', '20'].map((d) => ({ date: `2026-11-${d}T06:00:00.000Z` })) }
  };

  let sent: Array<{ to: string; subject: string; text: string; html: string; from: string; replyTo?: string }>;
  let events: { findOne: jest.Mock };
  let links: { newLink: jest.Mock };
  let service: SlidesRequestEmailService;
  let inFlight: number;
  let mostInFlight: number;

  const contact = () => ({
    sendMessage: jest.fn(async (m) => {
      inFlight++;
      mostInFlight = Math.max(mostInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      sent.push(m);
    })
  });

  beforeEach(() => {
    sent = [];
    inFlight = 0;
    mostInFlight = 0;
    events = { findOne: jest.fn(async ({ where }) => (where.guid === session.guid ? session : null)) };
    // Each speaker's own link, as SpeakerEditService makes them for the profile email.
    links = {
      newLink: jest.fn(async (speaker: { guid: string }) => ({
        url: `https://gisday.tamu.edu/presenters/edit/LINK-OF-${speaker.guid}`,
        expires: new Date('2026-11-22T18:00:00Z')
      }))
    };
    service = new SlidesRequestEmailService(events as never, contact() as never, links as never);
  });

  // #3147: a session marked as having no slides asks nobody for any, whatever page sends it.
  it('refuses to preview or send it for a session with no slides, and makes no link and sends nothing', async () => {
    events.findOne.mockImplementation(async () => ({ ...session, noSlides: true }));

    await expect(service.preview('e-1', 'gisday.tamu.edu')).rejects.toThrow(BadRequestException);
    await expect(service.send('e-1', 'gisday.tamu.edu')).rejects.toThrow(
      'No slides are needed for this session. Its speakers are not asked for any.'
    );
    expect(links.newLink).not.toHaveBeenCalled();
    expect(sent).toEqual([]);
  });

  it('previews it for the speakers with an address, a copy each, with a stand-in for the link; nothing is made or sent', async () => {
    const preview = await service.preview('e-1', 'gisday.tamu.edu');

    expect(sent).toEqual([]);
    expect(links.newLink).not.toHaveBeenCalled();
    expect(preview.groups).toHaveLength(1);

    const [group] = preview.groups;

    expect(group.kind).toBe(SLIDES_REQUEST_EMAIL_KIND);
    expect(group.count).toBe(2);
    expect(group.subject).toContain('Made-up hybrid session');
    // Texas A&M's site: when and where are in the design's details box, said once, not in the text too (#3126).
    expect(group.template).not.toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(group.design?.session).toEqual(
      expect.objectContaining({ when: 'Thursday, November 19, 2026, 1:00 to 2:15 PM Central', where: 'MSC 2300, and online' })
    );
    expect(group.template).toContain(SESSION_FILES_RULE);
    expect(group.example).toEqual(
      expect.objectContaining({
        title: 'Avery Example',
        to: 'avery@example.com',
        values: expect.objectContaining({ '{first name}': 'Avery', '{edit link}': PROFILE_EDIT_LINK_PREVIEW })
      })
    );
    expect(preview.recipients).toEqual([
      { guid: 'sp-av', name: 'Avery Example', firstName: 'Avery', email: 'avery@example.com' },
      { guid: 'sp-bl', name: 'Blair Sample', firstName: 'Blair', email: 'blair@example.com' }
    ]);
    // Always a copy each (decided 1A), and the window says why.
    expect(preview.copyEachReason).toBe(SLIDES_REQUEST_COPY_EACH);
    expect(preview.noAddress).toEqual(['Dee Fox']);
  });

  it('sends each speaker their own copy, with their own edit link and no one else’s', async () => {
    const result = await service.send('e-1', 'gisday.tamu.edu');

    expect(result.sent).toEqual(['Avery Example', 'Blair Sample']);
    expect(result.skipped).toEqual([{ name: 'Dee Fox', reason: 'no email address on their record' }]);
    expect(links.newLink).toHaveBeenCalledTimes(2);
    expect(links.newLink).toHaveBeenCalledWith(expect.objectContaining({ guid: 'sp-av' }), 'gisday.tamu.edu');

    const toAvery = sent.find((m) => m.to === 'avery@example.com');
    const toBlair = sent.find((m) => m.to === 'blair@example.com');

    expect(sent).toHaveLength(2);
    expect(toAvery.text).toContain('LINK-OF-sp-av');
    expect(toAvery.text).not.toContain('LINK-OF-sp-bl');
    expect(toBlair.text).toContain('LINK-OF-sp-bl');
    expect(toBlair.text).not.toContain('LINK-OF-sp-av');
    expect(toAvery.text).toContain('Howdy Avery,');
    expect(toAvery.subject).toBe('Your slides for Texas A&M GIS Day: Made-up hybrid session');
    expect(toAvery.html).toContain('<strong>Made-up hybrid session</strong>');
    expect(toAvery.text).not.toMatch(/\{[a-z ]+\}/);
  });

  /**
   * #3126: on gisday.tamu.edu it wears the Texas A&M GIS Day design, as the session details email does (#3114), with the
   * season's dates and the session in its details box; elsewhere it stays plain, with when and where in its text.
   */
  it("sends Texas A&M's speakers the designed email, each with their own link", async () => {
    await service.send('e-1', 'gisday.tamu.edu');
    const mail = sent.find((m) => m.to === 'avery@example.com');

    expect(mail.html).toContain('GIS DAY(S)');
    expect(mail.html).toContain('November 16–20, 2026');
    expect(mail.html).toContain('<b>Where:</b> MSC 2300');
    expect(mail.html).toContain('LINK-OF-sp-av');
    expect(mail.html).not.toContain('LINK-OF-sp-bl');
  });

  it('keeps a site without the design plain, with when and where in its text', async () => {
    const [group] = (await service.preview('e-1', 'gisday.ucgis.org')).groups;

    expect(group.template).toContain('**When:** Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(group.template).toContain('**Where:** MSC 2300');

    await service.send('e-1', 'gisday.ucgis.org');

    expect(sent.find((m) => m.to === 'avery@example.com').html).not.toContain('GIS DAY(S)');
  });

  it('sends it as edited', async () => {
    await service.send('e-1', 'gisday.tamu.edu', { subject: 'Slides, {first name}', template: 'Here: {edit link}' });

    expect(sent.find((m) => m.to === 'blair@example.com')).toEqual(
      expect.objectContaining({
        subject: 'Slides, Blair',
        text: 'Here: https://gisday.tamu.edu/presenters/edit/LINK-OF-sp-bl'
      })
    );
  });

  it('sends only to the speakers ticked, each their own copy (#3104)', async () => {
    const result = await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-bl']);

    expect(result).toEqual({ sent: ['Blair Sample'], skipped: [] });
    expect(sent.map((m) => m.to)).toEqual(['blair@example.com']);
    expect(links.newLink).toHaveBeenCalledTimes(1);
  });

  it('refuses a choice of no one, or of no speaker of this session, and sends nothing', async () => {
    await expect(service.send('e-1', 'gisday.tamu.edu', undefined, undefined, [])).rejects.toThrow(BadRequestException);
    await expect(service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-elsewhere'])).rejects.toThrow(
      BadRequestException
    );
    expect(sent).toEqual([]);
    expect(links.newLink).not.toHaveBeenCalled();
  });

  // #3100: as the sender the admin chose in the window, as the controller checked it, with replies to it.
  it('sends as the sender chosen, with replies to it', async () => {
    const chosen = { from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@example.com>', replyTo: 'jadmin@example.com' };

    await service.send('e-1', 'gisday.tamu.edu', undefined, chosen);

    expect(sent).toHaveLength(2);
    expect(sent).toEqual([expect.objectContaining(chosen), expect.objectContaining(chosen)]);
  });

  it('sends several at a time, as the other speaker emails do (#3067)', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      guid: `sp-${i}`,
      firstName: `P${i}`,
      lastName: 'X',
      email: `p${i}@example.com`
    }));

    events.findOne.mockResolvedValueOnce({ ...session, speakers: many });

    expect((await service.send('e-1', 'gisday.tamu.edu')).sent).toHaveLength(12);
    expect(mostInFlight).toBeGreaterThan(1);
  });

  it(`asks no one twice for the same session's slides within ${REPEAT_SEND_MINUTES} minutes, and says why (#3065)`, async () => {
    const [first, again] = await Promise.all([
      service.send('e-1', 'gisday.tamu.edu'),
      service.send('e-1', 'gisday.tamu.edu')
    ]);

    expect(sent).toHaveLength(2);
    expect(links.newLink).toHaveBeenCalledTimes(2);
    expect([...first.sent, ...again.sent].sort()).toEqual(['Avery Example', 'Blair Sample']);
    expect([...first.skipped, ...again.skipped]).toEqual(
      expect.arrayContaining([
        {
          name: 'Avery Example',
          reason: `already asked for this session's slides in the last ${REPEAT_SEND_MINUTES} minutes`
        }
      ])
    );
  });

  it('asks each speaker once when the repeat reaches the other copy of the API (#3260)', async () => {
    // Production runs two copies of the API, and a repeated send may reach either.
    const copy = () => new SlidesRequestEmailService(events as never, contact() as never, links as never);
    const [first, again] = await Promise.all([
      copy().send('e-1', 'gisday.tamu.edu'),
      copy().send('e-1', 'gisday.tamu.edu')
    ]);
    const repeats = [...first.skipped, ...again.skipped].filter((s) => /already asked/.test(s.reason));

    expect(sent.map((m) => m.to.trim()).sort()).toEqual(['avery@example.com', 'blair@example.com']);
    expect(repeats.map((s) => s.name).sort()).toEqual(['Avery Example', 'Blair Sample']);
  });

  it(`asks them again after ${REPEAT_SEND_MINUTES} minutes`, async () => {
    const now = jest.spyOn(Date, 'now');

    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z'));
    await service.send('e-1', 'gisday.tamu.edu');
    now.mockReturnValue(Date.parse('2026-11-16T15:00:00Z') + REPEAT_SEND_MINUTES * 60 * 1000 + 1);
    const again = await service.send('e-1', 'gisday.tamu.edu');
    now.mockRestore();

    expect(again.sent).toEqual(['Avery Example', 'Blair Sample']);
    expect(sent).toHaveLength(4);
  });

  it('keeps its record per speaker: another of the session’s speakers may be asked at once', async () => {
    await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-av']);

    expect((await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-bl'])).sent).toEqual(['Blair Sample']);
    expect((await service.send('e-1', 'gisday.tamu.edu', undefined, undefined, ['sp-av'])).sent).toEqual([]);
  });

  it('lets a speaker whose email failed be asked again at once, and says it failed', async () => {
    const failing = new SlidesRequestEmailService(
      events as never,
      { sendMessage: jest.fn().mockRejectedValueOnce(new Error('mail down')).mockResolvedValue({}) } as never,
      links as never
    );

    events.findOne.mockResolvedValue({ ...session, speakers: [avery] });

    expect(await failing.send('e-1', 'gisday.tamu.edu')).toEqual({
      sent: [],
      skipped: [{ name: 'Avery Example', reason: 'the email could not be sent' }]
    });
    expect((await failing.send('e-1', 'gisday.tamu.edu')).sent).toEqual(['Avery Example']);
  });

  it('refuses an edited email that drops the edit link, before any link is made', async () => {
    await expect(service.send('e-1', 'gisday.tamu.edu', { subject: 'S', template: 'No link here' })).rejects.toThrow(
      BadRequestException
    );
    expect(links.newLink).not.toHaveBeenCalled();
    expect(sent).toEqual([]);
  });

  it('refuses a session that does not exist, or none named', async () => {
    await expect(service.preview('nope', 'gisday.tamu.edu')).rejects.toThrow(NotFoundException);
    await expect(service.send(undefined as never, 'gisday.tamu.edu')).rejects.toThrow(BadRequestException);
    expect(sent).toEqual([]);
  });
});
