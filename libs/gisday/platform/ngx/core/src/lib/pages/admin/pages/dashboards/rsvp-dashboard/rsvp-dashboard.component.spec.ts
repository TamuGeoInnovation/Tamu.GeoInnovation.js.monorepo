import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import type { RsvpDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LINE_CHART_DRAWER, LineChartOptions } from '@tamu-gisc/ui-kits/ngx/charts';

import { rsvpBands, RsvpDashboardComponent, rsvpDaily, rsvpFileName, rsvpRows, rsvpSeries, rsvpTotals } from './rsvp-dashboard.component';

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

describe('rsvpRows()', () => {
  it("gives the table each event, its venue under its name and its start in its own column", () => {
    expect(rsvpRows(dashboard.events)[0]).toEqual({
      key: 'e-1',
      name: 'Workshop',
      note: 'ILCB 111',
      when: '2026-11-18T15:00:00.000Z',
      total: 3,
      counts: counts({ undergraduate: 2, academia: 1 })
    });
  });
});

describe('rsvpFileName()', () => {
  it("names an event's CSV by its name and day, in Central time", () => {
    expect(rsvpFileName(dashboard.events[0])).toBe('gisday-rsvps-workshop-2026-11-18');
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

describe('rsvpDaily()', () => {
  it("counts every event's new RSVPs each day", () => {
    expect(rsvpDaily(dashboard).points.map((p) => p.y)).toEqual([2, 1, 1]);
  });
});

describe('rsvpBands()', () => {
  it("shades the days the season's events run, in Central time", () => {
    expect(rsvpBands(dashboard)).toEqual([{ from: new Date('2026-11-18T00:00:00Z'), to: new Date('2026-11-19T00:00:00Z'), label: 'GIS Day week' }]);
  });

  it('shades nothing when no event has a day', () => {
    expect(rsvpBands({ ...dashboard, events: dashboard.events.map((e) => ({ ...e, starts: null })) })).toEqual([]);
  });
});

describe('RsvpDashboardComponent', () => {
  let rsvps: { getDashboardForSeason: jest.Mock; getDashboardForEvent: jest.Mock };
  // amCharts draws on a canvas, which the test's DOM does not have: the chart's drawer is a stand-in that keeps what it is given.
  let drawn: Array<LineChartOptions>;
  const lastChart = () => drawn[drawn.length - 1];

  function open() {
    TestBed.configureTestingModule({
      imports: [RsvpDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: RsvpService, useValue: rsvps },
        { provide: SeasonService, useValue: { seasons$: of([{ guid: 's-1', year: 2026 }]), activeSeason$: of({ guid: 's-1', year: 2026 }) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: LINE_CHART_DRAWER, useValue: (_host: HTMLElement, options: LineChartOptions) => (drawn.push(options), Promise.resolve(() => undefined)) }
      ]
    });

    const fixture = TestBed.createComponent(RsvpDashboardComponent);
    fixture.detectChanges();

    return fixture;
  }

  // The shared table (#2891), drawn by ngx-datatable.
  const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper datatable-body-row')).map((tr) =>
      Array.from(tr.querySelectorAll('.datatable-body-cell')).map((td) => td.textContent.trim())
    );
  const cellOf = (root: HTMLElement, name: string) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper .datatable-body-cell')).find((c) => c.textContent.includes(name)) as HTMLElement;

  async function settle(fixture: ReturnType<typeof open>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    drawn = [];
    rsvps = {
      getDashboardForSeason: jest.fn(() => of(dashboard)),
      getDashboardForEvent: jest.fn(() => of(people))
    };
  });

  it("reads the active season's dashboard and shows each event's counts, by type, with a total row", async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    expect(rsvps.getDashboardForSeason).toHaveBeenCalledWith('s-1');
    expect(root.querySelector('.rsvp-summary').textContent).toContain('4 RSVPs for 2 events');
    expect(Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((th) => th.textContent.trim())).toEqual([
      'Event',
      'When',
      'Total',
      'Undergraduate',
      'Graduate',
      'Student, classification not given',
      'Faculty & academia',
      'Industry',
      'Not given'
    ]);
    expect(rows(root).map((r) => r.slice(2))).toEqual([
      ['3', '2', '0', '0', '1', '0', '0'],
      ['1', '0', '0', '0', '0', '1', '0']
    ]);
    expect(Array.from(root.querySelectorAll('datatable-summary-row .datatable-body-cell')).map((td) => td.textContent.trim())).toEqual([
      'All events',
      '',
      '4',
      '2',
      '0',
      '0',
      '1',
      '1',
      '0'
    ]);
  });

  it("charts the running total, each day's new RSVPs beneath it, and the GIS Day week", async () => {
    const fixture = open();
    await fixture.whenStable();

    expect(lastChart().series.map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([['All events', [2, 3, 4]]]);
    expect(lastChart().steps).toBe(true);
    expect(lastChart().unit).toBe('RSVPs');
    expect(lastChart().bars.points.map((p) => p.y)).toEqual([2, 1, 1]);
    expect(lastChart().bands.map((b) => b.label)).toEqual(['GIS Day week']);
  });

  it("opens an event to list its people under their types, adds its line to the chart, and closes again", async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    cellOf(root, 'Workshop').click();
    await settle(fixture);

    expect(rsvps.getDashboardForEvent).toHaveBeenCalledWith('e-1');
    expect(root.querySelector('.dashboard-table-name[aria-expanded="true"]').textContent).toContain('Workshop');
    expect(Array.from(root.querySelectorAll('tamu-gisc-dashboard-people h4')).map((h) => h.textContent.trim())).toEqual([
      'Undergraduate (2)',
      'Faculty & academia (1)'
    ]);
    expect(root.querySelector('tamu-gisc-dashboard-people').textContent).toContain('ana@example.edu');
    expect(lastChart().series.map((s) => s.label)).toEqual(['All events', 'Workshop']);

    cellOf(root, 'Workshop').click();
    await settle(fixture);

    expect(root.querySelector('tamu-gisc-dashboard-people')).toBeNull();
    expect(lastChart().series.map((s) => s.label)).toEqual(['All events']);
  });

  it('says so while the people are being read, and if they cannot be', async () => {
    const pending = new Subject<Array<RsvpDashboardPerson>>();
    rsvps.getDashboardForEvent = jest.fn(() => pending);
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    cellOf(root, 'Workshop').click();
    await settle(fixture);
    expect(root.querySelector('tamu-gisc-dashboard-people').textContent).toContain('Reading the people');

    pending.error(new Error('403'));
    await settle(fixture);
    expect(root.querySelector('tamu-gisc-dashboard-people').textContent).toContain('could not be read');
  });

  it('says the RSVPs could not be read rather than showing an empty dashboard', () => {
    rsvps.getDashboardForSeason = jest.fn(() => throwError(() => new Error('403')));
    const root = open().nativeElement as HTMLElement;

    expect(root.textContent).toContain('The RSVPs could not be read');
    expect(root.querySelector('tamu-gisc-dashboard-table')).toBeNull();
  });
});
