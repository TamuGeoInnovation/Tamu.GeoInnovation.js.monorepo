import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import type { VgiDashboard, VgiSubmitter } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LINE_CHART_DRAWER, LineChartOptions } from '@tamu-gisc/ui-kits/ngx/charts';

import { VgiDashboardComponent } from './vgi-dashboard.component';

const counts = (c: Partial<VgiDashboard['events'][0]['counts']>) => ({
  newFinds: 0,
  repeats: 0,
  people: 0,
  unverified: 0,
  verified: 0,
  discarded: 0,
  ...c
});

const dashboard: VgiDashboard = {
  season: 's-1',
  // Ann submitted both types: three people in all, not four.
  people: 3,
  events: [
    {
      guid: 'monument',
      name: 'Monument',
      starts: null,
      total: 3,
      counts: counts({ newFinds: 1, repeats: 1, people: 3, unverified: 1, verified: 1, discarded: 1 })
    },
    { guid: 'plaque', name: 'Plaque', starts: null, total: 1, counts: counts({ newFinds: 1, people: 1, unverified: 1 }) }
  ],
  made: [
    { event: 'monument', created: '2026-11-14T15:01:00.000Z' },
    { event: 'monument', created: '2026-11-14T15:02:00.000Z' },
    { event: 'plaque', created: '2026-11-15T15:03:00.000Z' },
    { event: 'monument', created: '2026-11-15T15:04:00.000Z' }
  ],
  unreadAccounts: 0
};

const submitters: Array<VgiSubmitter> = [
  {
    firstName: 'Ann',
    lastName: 'Lee',
    email: 'ann@example.edu',
    type: 'industry',
    classification: null,
    department: null,
    position: null,
    organization: null,
    created: '2026-11-14T15:01:00.000Z',
    counts: { submissions: 2, newFinds: 1, repeats: 1 }
  }
];

/**
 * #2894: the VGI submissions dashboard, on the RSVP and check-in dashboards' page: a row per feature type with its
 * submissions, new finds and repeats, people and review statuses, a total row, a row's submitters with their counts, and
 * a chart of submissions over time.
 */
describe('VgiDashboardComponent (#2894)', () => {
  let vgi: { getDashboardForSeason: Mock; getDashboardForType: Mock };
  let drawn: Array<LineChartOptions>;

  function open() {
    TestBed.configureTestingModule({
      imports: [VgiDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: SubmissionService, useValue: vgi },
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

    const fixture = TestBed.createComponent(VgiDashboardComponent);
    fixture.detectChanges();

    return fixture;
  }

  async function settle(fixture: ReturnType<typeof open>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const headings = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((th) => th.textContent.trim());
  const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper datatable-body-row')).map((tr) =>
      Array.from(tr.querySelectorAll('.datatable-body-cell')).map((td) => td.textContent.trim())
    );
  const cellOf = (root: HTMLElement, name: string) =>
    Array.from(root.querySelectorAll('datatable-row-wrapper .datatable-body-cell')).find((c) =>
      c.textContent.includes(name)
    ) as HTMLElement;

  beforeEach(() => {
    drawn = [];
    vgi = {
      getDashboardForSeason: vi.fn(() => of(dashboard)),
      getDashboardForType: vi.fn(() => of(submitters))
    };
  });

  // The total row counts each person once, whatever types they submitted.
  // #3330: the dashboards share one template; each says what it always has.
  it('shows its title, summary, headings, notes and table headings as it always has', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const words = (selector: string) =>
      Array.from(root.querySelectorAll(selector)).map((e) => e.textContent.replace(/\s+/g, ' ').trim());

    expect([
      ...words('.form-section-name'),
      ...words('.dashboard-summary'),
      ...words('h3.dashboard-heading'),
      ...words('.dashboard-note'),
      ...words('datatable-header-cell')
    ]).toEqual([
      'VGI submissions',
      '4 submissions of 2 feature types, by 3 people.',
      'Submissions over time',
      'By feature type',
      "The running total at the end of each day, in Central time, with each day's submissions beneath. Hover for a day's numbers; drag across the chart to zoom in, and double-click to see it all again. Press a year to draw it beside this one, lined up on the Monday of each year's GIS Day week: the axis then counts days from it. Open a feature type below to add its own line.",
      "Each feature type on the season's form. New finds and repeats are scored as the leaderboard scores them; a discarded submission, or one outside the scoring window, is neither. Click a heading to sort by it, and again to reverse it. Click a feature type to see who submitted it.",
      'Feature type',
      'Sub\u00admissions',
      'New finds',
      'Repeats',
      'People',
      'Un\u00adverified',
      'Verified',
      'Dis\u00adcarded'
    ]);
  });

  it('shows a row per feature type with its submissions, finds, repeats, people and statuses, and a total row', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    expect(vgi.getDashboardForSeason).toHaveBeenCalledWith('s-1');
    expect(root.querySelector('.dashboard-summary').textContent).toContain('4 submissions of 2 feature types');
    expect(headings(root)).toEqual([
      'Feature type',
      // Breaks as "Sub-missions" in a narrow column, rather than cut to "Submissio".
      'Sub­missions',
      'New finds',
      'Repeats',
      'People',
      'Un\u00adverified',
      'Verified',
      'Dis\u00adcarded'
    ]);
    expect(rows(root).map((r) => r.slice(1))).toEqual([
      ['3', '1', '1', '3', '1', '1', '1'],
      ['1', '1', '0', '1', '1', '0', '0']
    ]);
    expect(
      Array.from(root.querySelectorAll('datatable-summary-row .datatable-body-cell')).map((td) => td.textContent.trim())
    ).toEqual(['All types', '4', '2', '1', '3', '2', '1', '1']);
  });

  it('charts submissions by day', async () => {
    const fixture = open();
    await fixture.whenStable();

    expect(drawn[drawn.length - 1].unit).toBe('submissions');
    expect(drawn[drawn.length - 1].series.map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([['All types', [2, 4]]]);
  });

  it('opens a type to its submitters with their counts, and names its CSV', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    cellOf(root, 'Monument').click();
    await settle(fixture);

    expect(vgi.getDashboardForType).toHaveBeenCalledWith('s-1', 'monument');
    const list = root.querySelector('tamu-gisc-dashboard-people');
    expect(Array.from(list.querySelectorAll('th')).map((th) => th.textContent.trim())).toEqual(
      expect.arrayContaining(['Submissions', 'New finds', 'Repeats', 'First submitted'])
    );
    expect(list.textContent).toContain('ann@example.edu');
    expect(fixture.componentInstance.fileName()).toBe('gisday-vgi-submissions-monument');
  });
});
