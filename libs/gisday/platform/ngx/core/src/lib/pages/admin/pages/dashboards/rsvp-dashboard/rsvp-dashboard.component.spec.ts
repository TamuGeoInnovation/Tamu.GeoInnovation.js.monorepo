import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import * as Papa from 'papaparse';

import type { RsvpDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { groupPeople, RsvpDashboardComponent, rsvpCsv, rsvpSeries, rsvpTotals } from './rsvp-dashboard.component';

const counts = (c: Partial<RsvpDashboard['events'][0]['counts']>) => ({
  undergraduate: 0,
  graduate: 0,
  student: 0,
  academia: 0,
  industry: 0,
  'not-given': 0,
  ...c
});

const dashboard: RsvpDashboard = {
  events: [
    { guid: 'e-1', name: 'Workshop', starts: '2026-11-18T15:00:00.000Z', location: 'ILCB 111', total: 3, counts: counts({ undergraduate: 2, academia: 1 }) },
    { guid: 'e-2', name: 'Keynote', starts: '2026-11-18T20:00:00.000Z', location: null, total: 1, counts: counts({ industry: 1 }) }
  ],
  made: [
    { event: 'e-1', created: '2026-11-01T15:00:00Z' },
    { event: 'e-1', created: '2026-11-01T16:00:00Z' },
    { event: 'e-2', created: '2026-11-03T15:00:00Z' },
    { event: 'e-1', created: '2026-11-04T15:00:00Z' }
  ],
  unreadAccounts: 0
};

const person = (p: Partial<RsvpDashboardPerson>): RsvpDashboardPerson => ({
  firstName: null,
  lastName: null,
  email: null,
  type: 'not-given',
  classification: null,
  department: null,
  position: null,
  organization: null,
  created: '2026-11-01T15:00:00.000Z',
  ...p
});

const people = [
  person({ firstName: 'Zoe', lastName: 'Young', email: 'zoe@example.edu', type: 'undergraduate', classification: 'Senior' }),
  person({ firstName: 'Ana', lastName: 'Lee', email: 'ana@example.edu', type: 'undergraduate', classification: 'Junior' }),
  person({ firstName: 'Pat', lastName: 'Kim', email: 'pat@example.edu', type: 'academia', position: 'Professor', organization: 'Texas A&M University' })
];

describe('rsvpTotals()', () => {
  it('adds up every event, type by type', () => {
    expect(rsvpTotals(dashboard.events)).toEqual({ total: 4, counts: counts({ undergraduate: 2, academia: 1, industry: 1 }) });
  });
});

describe('groupPeople()', () => {
  it('puts people under their type in the dashboard order, by last name, and leaves out empty types', () => {
    expect(groupPeople(people).map((g) => [g.label, g.people.map((p) => p.lastName)])).toEqual([
      ['Undergraduate', ['Lee', 'Young']],
      ['Faculty & academia', ['Kim']]
    ]);
  });
});

describe('rsvpCsv()', () => {
  it('writes one row per person, grouped and named as the page shows them', () => {
    const rows = Papa.parse<Record<string, string>>(rsvpCsv(people), { header: true }).data;

    expect(rows.map((r) => [r['Last name'], r['Person type'], r['Classification'], r['Position']])).toEqual([
      ['Lee', 'Undergraduate', 'Junior', ''],
      ['Young', 'Undergraduate', 'Senior', ''],
      ['Kim', 'Faculty & academia', '', 'Professor']
    ]);
    expect(rows[2]['University / employer']).toBe('Texas A&M University');
  });
});

describe('rsvpSeries()', () => {
  it("draws every event's running total, and the opened event's own beside it", () => {
    expect(rsvpSeries(dashboard, null).map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([['All events', [2, 3, 4]]]);
    expect(rsvpSeries(dashboard, dashboard.events[0]).map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([
      ['All events', [2, 3, 4]],
      ['Workshop', [2, 3]]
    ]);
  });
});

describe('RsvpDashboardComponent', () => {
  let rsvps: { getDashboardForSeason: jest.Mock; getDashboardForEvent: jest.Mock };

  function open() {
    TestBed.configureTestingModule({
      imports: [RsvpDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: RsvpService, useValue: rsvps },
        { provide: SeasonService, useValue: { seasons$: of([{ guid: 's-1', year: 2026 }]), activeSeason$: of({ guid: 's-1', year: 2026 }) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const fixture = TestBed.createComponent(RsvpDashboardComponent);
    fixture.detectChanges();

    return fixture;
  }

  const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('.rsvp-table > tbody > tr.rsvp-event')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
    );

  beforeEach(() => {
    rsvps = {
      getDashboardForSeason: jest.fn(() => of(dashboard)),
      getDashboardForEvent: jest.fn(() => of(people))
    };
  });

  it("reads the active season's dashboard and shows each event's counts, by type, with a total row", () => {
    const root = open().nativeElement as HTMLElement;

    expect(rsvps.getDashboardForSeason).toHaveBeenCalledWith('s-1');
    expect(root.querySelector('.rsvp-summary').textContent).toContain('4 RSVPs for 2 events');
    expect(Array.from(root.querySelectorAll('.rsvp-table > thead th')).map((th) => th.textContent.trim())).toEqual([
      'Event',
      'Total',
      'Undergraduate',
      'Graduate',
      'Student, classification not given',
      'Faculty & academia',
      'Industry',
      'Not given'
    ]);
    expect(rows(root).map((r) => r.slice(1))).toEqual([
      ['3', '2', '0', '0', '1', '0', '0'],
      ['1', '0', '0', '0', '0', '1', '0']
    ]);
    expect(Array.from(root.querySelectorAll('.rsvp-table tfoot td')).map((td) => td.textContent.trim())).toEqual([
      'All events',
      '4',
      '2',
      '0',
      '0',
      '1',
      '1',
      '0'
    ]);
  });

  it('draws the running total of RSVPs over time', () => {
    const root = open().nativeElement as HTMLElement;

    expect(root.querySelector('tamu-gisc-line-chart svg')).not.toBeNull();
    expect(root.querySelectorAll('tamu-gisc-line-chart path')).toHaveLength(1);
  });

  it("opens an event to list its people under their types, adds its line to the chart, and closes again", () => {
    const fixture = open();
    const root = fixture.nativeElement as HTMLElement;
    const first = root.querySelector('tr.rsvp-event') as HTMLElement;

    first.click();
    fixture.detectChanges();

    expect(rsvps.getDashboardForEvent).toHaveBeenCalledWith('e-1');
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(Array.from(root.querySelectorAll('.rsvp-people h4')).map((h) => h.textContent.trim())).toEqual([
      'Undergraduate (2)',
      'Faculty & academia (1)'
    ]);
    expect(root.querySelector('.rsvp-people').textContent).toContain('ana@example.edu');
    expect(root.querySelectorAll('tamu-gisc-line-chart path')).toHaveLength(2);

    first.click();
    fixture.detectChanges();

    expect(root.querySelector('.rsvp-people')).toBeNull();
    expect(root.querySelectorAll('tamu-gisc-line-chart path')).toHaveLength(1);
  });

  it('says so while the people are being read, and if they cannot be', () => {
    const pending = new Subject<Array<RsvpDashboardPerson>>();
    rsvps.getDashboardForEvent = jest.fn(() => pending);
    const fixture = open();
    const root = fixture.nativeElement as HTMLElement;

    (root.querySelector('tr.rsvp-event') as HTMLElement).click();
    fixture.detectChanges();
    expect(root.querySelector('.rsvp-people').textContent).toContain("Reading who RSVP'd");

    pending.error(new Error('403'));
    fixture.detectChanges();
    expect(root.querySelector('.rsvp-people').textContent).toContain('could not be read');
  });

  it('says the RSVPs could not be read rather than showing an empty dashboard', () => {
    rsvps.getDashboardForSeason = jest.fn(() => throwError(() => new Error('403')));
    const root = open().nativeElement as HTMLElement;

    expect(root.textContent).toContain('The RSVPs could not be read');
    expect(root.querySelector('.rsvp-table')).toBeNull();
  });
});
