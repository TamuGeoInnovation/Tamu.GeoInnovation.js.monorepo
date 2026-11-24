import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import type { CheckInDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LINE_CHART_DRAWER, LineChartOptions } from '@tamu-gisc/ui-kits/ngx/charts';

import { CheckInDashboardComponent } from './check-in-dashboard.component';

const counts = (c: Partial<CheckInDashboard['events'][0]['counts']>) => ({
  undergraduate: 0,
  graduate: 0,
  student: 0,
  academia: 0,
  industry: 0,
  'not-given': 0,
  ...c
});

const TAMU = { guid: 'p-tamu', name: 'Texas A&M University GIS Day(s)' };
const OTHER = { guid: 'p-other', name: 'Another university' };

const dashboard: CheckInDashboard = {
  events: [
    {
      guid: 'e-1',
      name: 'Workshop',
      starts: '2026-11-18T15:00:00.000Z',
      location: 'ILCB 111',
      place: TAMU,
      total: 2,
      rsvps: 5,
      counts: counts({ undergraduate: 1, industry: 1 })
    },
    {
      guid: 'e-2',
      name: 'Keynote',
      starts: '2026-11-18T20:00:00.000Z',
      location: null,
      place: null,
      total: 1,
      rsvps: 0,
      counts: counts({ academia: 1 })
    },
    {
      guid: 'e-3',
      name: 'Elsewhere',
      starts: '2026-11-19T15:00:00.000Z',
      location: null,
      place: OTHER,
      total: 4,
      rsvps: 4,
      counts: counts({ graduate: 4 })
    }
  ],
  made: [
    { event: 'e-1', created: '2026-11-18T15:05:00Z' },
    { event: 'e-1', created: '2026-11-18T15:10:00Z' },
    { event: 'e-2', created: '2026-11-18T20:01:00Z' },
    { event: 'e-3', created: '2026-11-19T15:01:00Z' }
  ],
  unreadAccounts: 0
};

const people: Array<RsvpDashboardPerson> = [
  {
    firstName: 'Ana',
    lastName: 'Lee',
    email: 'ana@example.edu',
    type: 'undergraduate',
    classification: 'Junior',
    department: null,
    position: null,
    organization: null,
    created: '2026-11-18T15:05:00.000Z'
  }
];

describe('CheckInDashboardComponent (#3006)', () => {
  let checkIns: { getDashboardForSeason: jest.Mock; getDashboardForEvent: jest.Mock };
  let site: string;
  let drawn: Array<LineChartOptions>;

  function open() {
    TestBed.configureTestingModule({
      imports: [CheckInDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: CheckinService, useValue: checkIns },
        { provide: GISDAY_SITE, useValue: gisdaySite(site) },
        {
          provide: SeasonService,
          useValue: { seasons$: of([{ guid: 's-1', year: 2026 }]), activeSeason$: of({ guid: 's-1', year: 2026 }) }
        },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        {
          provide: LINE_CHART_DRAWER,
          useValue: (_host: HTMLElement, options: LineChartOptions) => (
            drawn.push(options),
            Promise.resolve(() => undefined)
          )
        }
      ]
    });

    const fixture = TestBed.createComponent(CheckInDashboardComponent);
    fixture.detectChanges();

    return fixture;
  }

  const headings = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((th) => th.textContent.trim());
  const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper datatable-body-row')).map((tr) =>
      Array.from(tr.querySelectorAll('.datatable-body-cell')).map((td) => td.textContent.trim())
    );
  const names = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper .dashboard-table-name .bold')).map((n) => n.textContent.trim());
  const cellOf = (root: HTMLElement, name: string) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper .datatable-body-cell')).find((c) =>
      c.textContent.includes(name)
    ) as HTMLElement;

  async function settle(fixture: ReturnType<typeof open>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    drawn = [];
    site = 'txgisday';
    checkIns = {
      getDashboardForSeason: jest.fn(() => of(dashboard)),
      getDashboardForEvent: jest.fn(() => of(people))
    };
  });

  // #3330: the dashboards share one template; each says what it always has.
  it('shows its title, summary, headings, notes and table headings as it always has', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const words = (selector: string) => Array.from(root.querySelectorAll(selector)).map((e) => e.textContent.replace(/\s+/g, ' ').trim());

    expect([
      ...words('.form-section-name'),
      ...words('.dashboard-summary'),
      ...words('h3.dashboard-heading'),
      ...words('.dashboard-note'),
      ...words('datatable-header-cell')
    ]).toEqual([
      'Check-ins',
      '7 check-ins at 3 events.',
      'Check-ins over time',
      'By event',
      'The running total at the end of each day, in Central time, with each day\'s check-ins beneath and the GIS Day week shaded. Hover for a day\'s numbers; drag across the chart to zoom in, and double-click to see it all again. Press a year to draw it beside this one, lined up on the Monday of each year\'s GIS Day week: the axis then counts days from it. Open an event below to add its own line.',
      'Each event\'s check-ins, with how many RSVP\'d beside them. Click a heading to sort by it, and again to reverse it. Click an event to see who checked in.',
      'Event',
      'When',
      'Checked in',
      'RSVPs',
      'Under\u00adgraduate',
      'Graduate',
      'Student, classi\u00adfication not given',
      'Faculty & academia',
      'Industry',
      'Not given'
    ]);
  });

  it("shows each event's check-ins by type, with its RSVPs beside them, and a total row", async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    expect(checkIns.getDashboardForSeason).toHaveBeenCalledWith('s-1');
    expect(root.querySelector('.dashboard-summary').textContent).toContain('7 check-ins at 3 events');
    expect(headings(root).slice(0, 5)).toEqual(['Event', 'When', 'Checked in', 'RSVPs', 'Under­graduate']);
    expect(names(root)).toEqual(['Workshop', 'Keynote', 'Elsewhere']);
    expect(rows(root).map((r) => r.slice(2, 4))).toEqual([
      ['2', '5'],
      ['1', '0'],
      ['4', '4']
    ]);
    expect(
      Array.from(root.querySelectorAll('datatable-summary-row .datatable-body-cell'))
        .map((td) => td.textContent.trim())
        .slice(0, 4)
    ).toEqual(['All events', '', '7', '9']);
  });

  it('charts check-ins by day', async () => {
    const fixture = open();
    await fixture.whenStable();

    expect(drawn[drawn.length - 1].unit).toBe('check-ins');
    expect(drawn[drawn.length - 1].series.map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([['All events', [3, 4]]]);
  });

  it('opens an event to list who checked in, and when', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    cellOf(root, 'Workshop').click();
    await settle(fixture);

    expect(checkIns.getDashboardForEvent).toHaveBeenCalledWith('e-1');
    const list = root.querySelector('tamu-gisc-dashboard-people');
    expect(Array.from(list.querySelectorAll('th')).map((th) => th.textContent.trim())).toContain('Checked in');
    expect(list.textContent).toContain('ana@example.edu');
    expect(fixture.componentInstance.fileName()).toBe('gisday-check-ins-workshop-2026-11-18');
  });

  it('says the check-ins could not be read rather than showing an empty dashboard', () => {
    checkIns.getDashboardForSeason = jest.fn(() => throwError(() => new Error('403')));
    const root = open().nativeElement as HTMLElement;

    expect(root.textContent).toContain('The check-ins could not be read');
    expect(root.querySelector('tamu-gisc-dashboard-table')).toBeNull();
  });

  // #3038: a 403 is a missing permission, which trying again can't fix, so the page says which.
  it('names the missing permission on a 403, rather than saying to try again', () => {
    checkIns.getDashboardForSeason = jest.fn(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { statusCode: 403, message: "Your account doesn't have the permission this needs: read:checkins." }
          })
      )
    );
    const root = open().nativeElement as HTMLElement;

    expect(root.textContent).toContain('read:checkins');
    expect(root.textContent).not.toContain('Try again in a moment');
  });

  // #3038: an API that names nothing (an older one, or no permissions at all) still says what to do.
  it('says the account lacks a permission on a bare 403', () => {
    checkIns.getDashboardForSeason = jest.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 403, error: { statusCode: 403, message: 'Forbidden' } }))
    );
    const root = open().nativeElement as HTMLElement;

    expect(root.textContent).toContain("doesn't have the permission this page needs");
  });
});
