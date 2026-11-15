import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { gisdaySite } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE } from '../../site/site';
import { SessionsUsingComponent } from './sessions-using.component';

const TAMU = { guid: 'p-tamu', name: 'Texas A&M University GIS Day(s)' };
const OTHER = { guid: 'p-other', name: 'Another university' };
const day = (date: string) => ({ date: new Date(date) });

/** #3032, #3033: an admin page lists the sessions that use what it edits, a broadcast or a tag. */
describe('SessionsUsingComponent', () => {
  const sessions = [
    {
      guid: 'e-late',
      name: 'Keynote',
      startTime: '15:00:00 GMT-0600 (Central Standard Time)',
      day: day('2026-11-18T06:00:00Z'),
      location: { place: TAMU }
    },
    {
      guid: 'e-early',
      name: 'Workshop',
      startTime: '09:00:00 GMT-0600 (Central Standard Time)',
      day: day('2026-11-17T06:00:00Z')
    },
    {
      guid: 'e-elsewhere',
      name: 'Elsewhere',
      startTime: '10:00:00 GMT-0600 (Central Standard Time)',
      day: day('2026-11-17T06:00:00Z'),
      location: { place: OTHER }
    }
  ];

  function render(list: Array<object> | null, site = 'txgisday') {
    TestBed.configureTestingModule({
      imports: [SessionsUsingComponent],
      providers: [provideRouter([]), { provide: GISDAY_SITE, useValue: gisdaySite(site) }]
    });

    const fixture = TestBed.createComponent(SessionsUsingComponent);
    fixture.componentRef.setInput('sessions', list);
    fixture.componentRef.setInput('one', 'session uses this broadcast');
    fixture.componentRef.setInput('many', 'sessions use this broadcast');
    fixture.componentRef.setInput('none', 'No sessions use this broadcast.');
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('tbody tr'), (tr) =>
      Array.from(tr.querySelectorAll('td'), (td) => td.textContent.replace(/\s+/g, ' ').trim())
    );

  it('lists them in date and time order, each day, time and name, with a count', () => {
    const root = render(sessions);

    expect(root.textContent).toContain('3 sessions use this broadcast');
    expect(rows(root)).toEqual([
      ['Tue, Nov 17', '9:00 AM', 'Workshop'],
      ['Tue, Nov 17', '10:00 AM', 'Elsewhere'],
      ['Wed, Nov 18', '3:00 PM', 'Keynote']
    ]);
  });

  it("links each to the session's admin page", () => {
    const root = render(sessions);

    expect(root.querySelector('tbody tr a').getAttribute('href')).toBe('/admin/events/edit/e-early');
  });

  it("lists only the site's own sessions, and any with no place yet, on gisday.tamu.edu (#2986)", () => {
    const root = render(sessions, 'tamu');

    expect(rows(root).map((r) => r[2])).toEqual(['Workshop', 'Keynote']);
    expect(root.textContent).toContain('2 sessions use this broadcast');
  });

  it('says so when none do, and while they are read', () => {
    expect(render([]).textContent).toContain('No sessions use this broadcast.');
    TestBed.resetTestingModule();
    expect(render(null).textContent).toContain('Reading the sessions');
  });

  it('says one in the singular', () => {
    expect(render([sessions[0]]).textContent).toContain('1 session uses this broadcast');
  });
});
