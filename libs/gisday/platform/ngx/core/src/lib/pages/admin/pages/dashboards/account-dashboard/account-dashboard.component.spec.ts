import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import type { AccountDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LINE_CHART_DRAWER, LineChartOptions } from '@tamu-gisc/ui-kits/ngx/charts';

import { accountFileName, accountSeries, accountTableRows, AccountDashboardComponent } from './account-dashboard.component';

const counts = (c: Partial<AccountDashboard['rows'][0]['counts']>) => ({
  undergraduate: 0,
  graduate: 0,
  student: 0,
  academia: 0,
  industry: 0,
  'not-given': 0,
  ...c
});

const dashboard: AccountDashboard = {
  window: { from: '2025-11-22T06:00:00.000Z', to: '2026-11-21T06:00:00.000Z' },
  accounts: 3,
  allAccounts: 5,
  rows: [
    { key: 'texas a&m university', name: 'Texas A&M University', total: 2, counts: counts({ undergraduate: 1, academia: 1 }) },
    { key: 'esri', name: 'Esri', total: 1, counts: counts({ industry: 1 }) }
  ],
  made: ['2026-01-10T15:00:00.000Z', '2026-01-10T18:00:00.000Z', '2026-10-01T15:00:00.000Z']
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
    organization: 'Texas A&M University',
    created: '2026-01-10T15:00:00.000Z'
  }
];

describe('accountTableRows()', () => {
  it('gives the table each university or employer with its counts', () => {
    expect(accountTableRows(dashboard)[1]).toEqual({ key: 'esri', name: 'Esri', total: 1, counts: counts({ industry: 1 }) });
  });
});

describe('accountSeries()', () => {
  it('charts the running total of accounts by day, and each day\'s new ones', () => {
    const { series, daily } = accountSeries(dashboard);

    expect(series.map((s) => [s.label, s.points.map((p) => p.y)])).toEqual([['Accounts', [2, 3]]]);
    expect(daily.points.map((p) => p.y)).toEqual([2, 1]);
  });
});

describe('accountFileName()', () => {
  it('names a row\'s CSV by the season and the university or employer', () => {
    expect(accountFileName(2026, 'Texas A&M University')).toBe('gisday-accounts-2026-texas-a-m-university');
  });
});

describe('AccountDashboardComponent', () => {
  let users: { getDashboardForSeason: jest.Mock; getDashboardRow: jest.Mock };
  let drawn: Array<LineChartOptions>;

  function open() {
    TestBed.configureTestingModule({
      imports: [AccountDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: users },
        { provide: SeasonService, useValue: { seasons$: of([{ guid: 's-1', year: 2026 }]), activeSeason$: of({ guid: 's-1', year: 2026 }) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: LINE_CHART_DRAWER, useValue: (_host: HTMLElement, options: LineChartOptions) => (drawn.push(options), Promise.resolve(() => undefined)) }
      ]
    });

    return TestBed.createComponent(AccountDashboardComponent);
  }

  async function settle(fixture: ReturnType<typeof open>) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    drawn = [];
    users = {
      getDashboardForSeason: jest.fn(() => of(dashboard)),
      getDashboardRow: jest.fn(() => of(people))
    };
  });

  it("reads the season's accounts and says how many, from when to when, and how many the sign-in service made", async () => {
    const fixture = open();
    await settle(fixture);
    const summary = (fixture.nativeElement as HTMLElement).querySelector('.dashboard-summary').textContent.replace(/\s+/g, ' ');

    expect(users.getDashboardForSeason).toHaveBeenCalledWith('s-1');
    expect(summary).toContain('3 accounts with a GIS Day profile, made from Nov 22, 2025 to the end of this GIS Day (Nov 20, 2026)');
    expect(summary).toContain('made 5 accounts in that time');
  });

  it('counts each university or employer by person type, with a total row, and charts the accounts over time', async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;

    expect(Array.from(root.querySelectorAll('datatable-row-wrapper .dashboard-table-name .bold')).map((n) => n.textContent.trim())).toEqual([
      'Texas A&M University',
      'Esri'
    ]);
    expect(Array.from(root.querySelectorAll('datatable-summary-row .datatable-body-cell')).map((c) => c.textContent.trim())).toEqual([
      'All accounts',
      '3',
      '1',
      '0',
      '0',
      '1',
      '1',
      '0'
    ]);
    expect(drawn[drawn.length - 1].series[0].label).toBe('Accounts');
  });

  it("opens a university or employer to list its people, read by the row's key", async () => {
    const fixture = open();
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const cell = Array.from(root.querySelectorAll('datatable-row-wrapper .datatable-body-cell')).find((c) =>
      c.textContent.includes('Texas A&M University')
    ) as HTMLElement;

    cell.click();
    await settle(fixture);

    expect(users.getDashboardRow).toHaveBeenCalledWith('s-1', 'texas a&m university');
    expect(root.querySelector('tamu-gisc-dashboard-people').textContent).toContain('ana@example.edu');
    expect(root.querySelector('tamu-gisc-dashboard-people th:last-child').textContent).toBe('Account made');
  });

  it('says the accounts could not be read rather than showing an empty dashboard', async () => {
    users.getDashboardForSeason = jest.fn(() => throwError(() => new Error('503')));
    const fixture = open();
    await settle(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('The accounts could not be read');
  });
});
