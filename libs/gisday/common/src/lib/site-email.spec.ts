import { emailHtml } from './email-markdown';
import { gisdaySite } from './sites';
import { EmailDesign, EmailSessionDetails, seasonDatesLine, seasonDayStrip, senderOf, siteEmailHtml } from './site-email';

/**
 * #3114: on Texas A&M's site every email the site sends wears the department's GIS Day email design (the maintainer's
 * shell, every style inline), filled from the season, the sender and the session; txgisday.org and UCGIS stay plain
 * (decided 2A).
 */
describe('siteEmailHtml (#3114)', () => {
  // The 2026 season's days as the database gives them: each day at midnight Central.
  const days = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'].map((d) => `${d}T06:00:00.000Z`);
  const session: EmailSessionDetails = {
    name: 'Mapping floods',
    when: 'Thursday, November 19, 2026, 1:00 to 2:15 PM Central',
    where: 'MSC 2300'
  };
  const design: EmailDesign = {
    label: 'Your session',
    days,
    session,
    why: 'You are getting this email because you are presenting at Texas A&M GIS Day.'
  };
  const text = 'Howdy **Ana**,\n\nHere are your details.\n\n— The Texas A&M GIS Day Team';
  const from = '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>';
  const tamu = (d: EmailDesign | null = design) =>
    siteEmailHtml(text, { site: gisdaySite('tamu'), subject: 'Your session', from, design: d });

  it("wraps Texas A&M's email in the GIS Day design, its text as the body", () => {
    const html = tamu();

    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('TEXAS A&amp;M UNIVERSITY&nbsp;&nbsp;|&nbsp;&nbsp;DEPARTMENT OF GEOGRAPHY');
    expect(html).toContain('GIS DAY(S)');
    expect(html).toContain('YOUR SESSION');
    expect(html).toContain(emailHtml(text));
  });

  it('takes the dates and the day strip from the season, not from the template', () => {
    const html = tamu();

    expect(html).toContain('November 16–20, 2026');
    expect(html).not.toContain('{{');
    for (const [weekday, date] of [
      ['MON', 'Nov 16'],
      ['TUE', 'Nov 17'],
      ['WED', 'Nov 18'],
      ['THU', 'Nov 19'],
      ['FRI', 'Nov 20']
    ]) {
      expect(html).toContain(`>${weekday}</div><div style="font-size:11px;color:#e8d9c0;line-height:14px;">${date}<`);
    }
  });

  it('signs off as the sender chosen, and shows the session in the details box', () => {
    const html = tamu();

    expect(html).toContain('Jo Admin (Texas A&amp;M GIS Day)');
    expect(html).toContain('href="mailto:jadmin@tamu.edu"');
    expect(html).toContain('Mapping floods');
    expect(html).toContain('<b>Where:</b> MSC 2300');
  });

  it('leaves out the details box with no session, and never has an unsubscribe line or a style block', () => {
    const html = tamu({ ...design, session: null });

    expect(html).not.toContain('<b>When:</b>');
    expect(html).not.toMatch(/unsubscribe/i);
    expect(html).not.toContain('<style');
    // Escaped, as everything filled in is.
    expect(html).toContain(design.why.replace('&', '&amp;'));
  });

  it('keeps txgisday.org and UCGIS plain, as before', () => {
    for (const key of ['txgisday', 'ucgis']) {
      expect(siteEmailHtml(text, { site: gisdaySite(key), subject: 'Your session', from, design })).toBe(emailHtml(text));
    }
  });

  it('escapes what it fills in, so a name cannot break the email', () => {
    const html = siteEmailHtml(text, {
      site: gisdaySite('tamu'),
      subject: 'A <b> subject',
      from: '"Jo <script>" <jo@tamu.edu>',
      design: { ...design, session: { ...session, name: 'Floods & <rivers>' } }
    });

    expect(html).toContain('Floods &amp; &lt;rivers&gt;');
    expect(html).not.toContain('<script>');
  });
});

describe('the season in the design (#3114)', () => {
  it('says the dates as the title block does, across months and for one day', () => {
    expect(seasonDatesLine(['2026-11-16', '2026-11-20', '2026-11-18'])).toBe('November 16–20, 2026');
    expect(seasonDatesLine(['2026-10-30', '2026-11-02'])).toBe('October 30–November 2, 2026');
    expect(seasonDatesLine(['2026-11-18'])).toBe('November 18, 2026');
    expect(seasonDatesLine([])).toBe('');
  });

  it('lists each day once, in order', () => {
    expect(seasonDayStrip(['2026-11-17', '2026-11-16', '2026-11-16T06:00:00.000Z'])).toEqual([
      { weekday: 'MON', date: 'Nov 16' },
      { weekday: 'TUE', date: 'Nov 17' }
    ]);
  });

  it("reads a From header's name and address", () => {
    expect(senderOf('"Texas A&M GIS Day" <gisday@tamu.edu>')).toEqual({
      name: 'Texas A&M GIS Day',
      address: 'gisday@tamu.edu'
    });
    expect(senderOf('gisday@tamu.edu')).toEqual({ name: null, address: 'gisday@tamu.edu' });
    expect(senderOf(undefined)).toEqual({ name: null, address: null });
  });
});
