import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, DatePipe } from '@angular/common';
import { User } from '@auth0/auth0-angular';
import { catchError, filter, of, switchMap, tap } from 'rxjs';

import type { AccountDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ChartSeries, countsByDay, LineChartComponent, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { fileNamePart } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
import { DashboardPeopleComponent, PERSON_TYPE_COLUMNS } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent, DashboardTableRow } from '../shared/dashboard-table/dashboard-table.component';

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
 * The User accounts dashboard (#2892): the accounts with a GIS Day profile made between the previous GIS Day and this
 * one, by university or employer and person type, how they grew, and, one row at a time, who they are.
 */
@Component({
  selector: 'tamu-gisc-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
  imports: [SelectComponent, LineChartComponent, DashboardTableComponent, DashboardRowDetailDirective, DashboardPeopleComponent, AsyncPipe, DatePipe]
})
export class AccountDashboardComponent extends BaseAdminListComponent<User> implements OnInit {
  protected readonly entityService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns = PERSON_TYPE_COLUMNS;

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<AccountDashboard | null>(null);
  public readonly failed = signal(false);
  private readonly season = signal<{ guid: string; year: number } | null>(null);

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
  /** The window's last day: it ends at the midnight that starts the day after. */
  public readonly lastDay = computed(() => {
    const to = this.dashboard()?.window.to;

    return to ? new Date(new Date(to).getTime() - 1) : null;
  });
  public readonly fileName = computed(() => {
    const row = this.dashboard()?.rows.find((r) => r.key === this.expanded());

    return accountFileName(this.season()?.year, row?.name ?? 'accounts');
  });

  public override ngOnInit(): void {
    super.ngOnInit();

    this.selectedSeason$
      .pipe(
        filter((season) => Boolean(season?.guid)),
        tap((season) => {
          this.season.set({ guid: season.guid, year: season.year });
          this.dashboard.set(null);
          this.failed.set(false);
          this.collapse();
        }),
        switchMap((season) =>
          this.entityService.getDashboardForSeason(season.guid).pipe(
            catchError(() => {
              this.failed.set(true);

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

    this.entityService.getDashboardRow(season.guid, key).subscribe({
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
