import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { readRefusal, seasonPicker } from '@tamu-gisc/gisday/platform/ngx/common';

import type { AccountDashboard, RsvpDashboardPerson, Season } from '@tamu-gisc/gisday/platform/data-api';
import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ChartSeries, countsByDay, LineChartComponent, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { fileNamePart } from '@tamu-gisc/common/utils/ui';

import { SeasonComparison } from '../shared/season-comparison/season-comparison';
import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { DashboardPeopleComponent, PERSON_TYPE_COLUMNS } from '../shared/dashboard-people/dashboard-people.component';
import {
  DashboardRowDetailDirective,
  DashboardTableComponent,
  DashboardTableRow
} from '../shared/dashboard-table/dashboard-table.component';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

/** The table's rows: a university or employer each, its accounts counted by person type. */
export function accountTableRows(dashboard: AccountDashboard): Array<DashboardTableRow> {
  return dashboard.rows.map((r) => ({ key: r.key, name: r.name, total: r.total, counts: r.counts }));
}

/** The chart: the running total of accounts made, by day, and each day's new ones beneath it. */
export function accountSeries(dashboard: AccountDashboard): { series: Array<ChartSeries>; daily: ChartSeries } {
  return {
    series: [{ label: 'Accounts', points: runningTotalByDay(dashboard.made) }],
    daily: { label: 'New that day', points: countsByDay(dashboard.made) }
  };
}

/** A row's CSV file name: gisday-accounts-<year>-<university or employer>. */
export function accountFileName(year: number | null | undefined, rowName: string): string {
  return ['gisday-accounts', year, fileNamePart(rowName)].filter(Boolean).join('-');
}

/**
 * What the page says when Auth0 is limiting how often accounts can be read: the API answers 503 with Retry-After
 * (#3747). Null for any other failure.
 */
export function busyMessage(err: unknown): string | null {
  const response = err as { status?: unknown; headers?: { get(name: string): string | null } } | null | undefined;

  if (response?.status !== 503) {
    return null;
  }

  const seconds = Number(response.headers?.get('Retry-After'));

  return (
    'The account counts are temporarily unavailable: the sign-in service is busy.' +
    (seconds > 0 ? ` Try again in ${seconds} seconds.` : ' Try again in a minute.')
  );
}

/**
 * The User accounts dashboard (#2892): the accounts with a GIS Day profile made between the previous GIS Day and this
 * one, by university or employer and person type, how they grew, and, one row at a time, who they are.
 */
@Component({
  selector: 'tamu-gisc-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
  imports: [
    SelectComponent,
    LineChartComponent,
    SeasonComparisonComponent,
    DashboardTableComponent,
    DashboardRowDetailDirective,
    DashboardPeopleComponent,
    AsyncPipe,
    CentralDatePipe
  ]
})
export class AccountDashboardComponent implements OnInit {
  /** The season shown, from the address (#3329). */
  private readonly picker = seasonPicker();
  public readonly seasons$ = this.picker.seasons$;
  public readonly selectedSeason$ = this.picker.season$;

  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns = PERSON_TYPE_COLUMNS;

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<AccountDashboard | null>(null);
  public readonly failed = signal(false);
  /** Why it could not be read, when trying again won't help: a missing permission or an expired sign-in (#3038). */
  public readonly refusal = signal<string | null>(null);
  private readonly season = signal<{ guid: string; year: number | undefined } | null>(null);

  /** The row whose people are shown, and them once they are read. */
  public readonly expanded = signal<string | null>(null);
  public readonly people = signal<Array<RsvpDashboardPerson> | null>(null);
  public readonly peopleFailed = signal(false);

  public readonly rows = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? accountTableRows(dashboard) : [];
  });
  public readonly chart = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? accountSeries(dashboard) : { series: [], daily: null };
  });
  /** The earlier seasons beside this one on the chart (#3215), once the page knows its seasons. */
  public readonly comparison = signal<SeasonComparison | null>(null);
  /** The chart's line with the compared seasons', and the day its axis counts from when there are any. */
  public readonly compared = computed(
    () => this.comparison()?.compare(this.chart().series) ?? { series: this.chart().series, anchor: null }
  );
  /** The window's last day: it ends at the midnight that starts the day after. */
  public readonly lastDay = computed(() => {
    const to = this.dashboard()?.window.to;

    return to ? new Date(new Date(to).getTime() - 1) : null;
  });
  public readonly fileName = computed(() => {
    const row = this.dashboard()?.rows.find((r) => r.key === this.expanded());

    return accountFileName(this.season()?.year, row?.name ?? 'accounts');
  });

  public setSeason(seasonGuid: string) {
    this.picker.choose(seasonGuid);
  }

  public ngOnInit(): void {
    this.comparison.set(
      new SeasonComparison(
        (guid) => this.users.getDashboardForSeason(guid).pipe(map((d) => d.made)),
        this.seasons$,
        this.selectedSeason$,
        this.destroyRef,
        'accounts'
      )
    );

    this.selectedSeason$
      .pipe(
        filter((season): season is Partial<Season> & { guid: string } => Boolean(season?.guid)),
        tap((season) => {
          this.season.set({ guid: season.guid, year: season.year });
          this.dashboard.set(null);
          this.failed.set(false);
          this.refusal.set(null);
          this.collapse();
        }),
        switchMap((season) =>
          this.users.getDashboardForSeason(season.guid).pipe(
            catchError((err) => {
              this.failed.set(true);
              this.refusal.set(readRefusal(err) ?? busyMessage(err));

              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((dashboard) => this.dashboard.set(dashboard));
  }

  /** Reads the people of the row the table opened, or forgets them when it closes. */
  public toggle(key: string | null) {
    const season = this.season();

    if (!key || !season) {
      this.collapse();

      return;
    }

    this.expanded.set(key);
    this.people.set(null);
    this.peopleFailed.set(false);

    this.users.getDashboardRow(season.guid, key).subscribe({
      next: (people) => {
        if (this.expanded() === key) {
          this.people.set(people);
        }
      },
      error: () => {
        if (this.expanded() === key) {
          this.peopleFailed.set(true);
        }
      }
    });
  }

  public collapse() {
    this.expanded.set(null);
    this.people.set(null);
    this.peopleFailed.set(false);
  }
}
