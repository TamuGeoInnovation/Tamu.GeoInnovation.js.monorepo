import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { catchError, filter, of, switchMap, tap } from 'rxjs';

import { RSVP_PERSON_TYPES, RsvpPersonTypeCounts } from '@tamu-gisc/gisday/common';
import type {
  RsvpDashboard,
  RsvpDashboardEvent,
  RsvpDashboardPerson,
  UserRsvp
} from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { bandOfDays, ChartBand, ChartSeries, countsByDay, dayIn, LineChartComponent, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { fileNamePart } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
import { DashboardPeopleComponent } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent, DashboardTableRow } from '../shared/dashboard-table/dashboard-table.component';

/** Every type's count summed over `events`, and the total, for the table's last row. */
export function rsvpTotals(events: Array<RsvpDashboardEvent>): { total: number; counts: RsvpPersonTypeCounts } {
  const counts = Object.fromEntries(RSVP_PERSON_TYPES.map(({ type }) => [type, 0])) as RsvpPersonTypeCounts;

  for (const event of events) {
    for (const { type } of RSVP_PERSON_TYPES) {
      counts[type] += event.counts[type];
    }
  }

  return { total: events.reduce((sum, e) => sum + e.total, 0), counts };
}

/** The table's rows: each event, its venue under its name, its start in its own column, and its counts by type. */
export function rsvpRows(events: Array<RsvpDashboardEvent>): Array<DashboardTableRow> {
  return events.map((e) => ({ key: e.guid, name: e.name ?? 'Untitled event', note: e.location, when: e.starts, total: e.total, counts: e.counts }));
}

/** An event's CSV file name: its name and day, as gisday-rsvps-<name>-<day>. */
export function rsvpFileName(event: RsvpDashboardEvent): string {
  const name = [fileNamePart(event.name ?? 'event'), event.starts ? dayIn(new Date(event.starts), 'America/Chicago') : null]
    .filter(Boolean)
    .join('-');

  return `gisday-rsvps-${name}`;
}

/** The chart's lines: every event's RSVPs as a running total by day, and the expanded event's own, if one is. */
export function rsvpSeries(dashboard: RsvpDashboard, expanded: RsvpDashboardEvent | null): Array<ChartSeries> {
  const series: Array<ChartSeries> = [{ label: 'All events', points: runningTotalByDay(dashboard.made.map((m) => m.created)) }];

  if (expanded) {
    series.push({
      label: expanded.name ?? 'This event',
      points: runningTotalByDay(dashboard.made.filter((m) => m.event === expanded.guid).map((m) => m.created))
    });
  }

  return series;
}

/** The columns under the chart: how many RSVPs every event gained each day (#2886). */
export function rsvpDaily(dashboard: RsvpDashboard): ChartSeries {
  return { label: 'New that day', points: countsByDay(dashboard.made.map((m) => m.created)) };
}

/** The days the season's events run, shaded on the chart, so sign-ups before the week and during it can be told apart. */
export function rsvpBands(dashboard: RsvpDashboard): Array<ChartBand> {
  const band = bandOfDays(dashboard.events.map((e) => e.starts).filter((s): s is string => Boolean(s)), 'GIS Day week');

  return band ? [band] : [];
}

/**
 * The RSVP dashboard (#2878): how many people have RSVP'd for each of the season's events, by person type, how that
 * has grown over time, and, for one event at a time, who they are, with a CSV of them.
 */
@Component({
  selector: 'tamu-gisc-rsvp-dashboard',
  templateUrl: './rsvp-dashboard.component.html',
  styleUrls: ['./rsvp-dashboard.component.scss'],
  imports: [SelectComponent, LineChartComponent, DashboardTableComponent, DashboardRowDetailDirective, DashboardPeopleComponent, AsyncPipe]
})
export class RsvpDashboardComponent extends BaseAdminListComponent<UserRsvp> implements OnInit {
  protected readonly entityService = inject(RsvpService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns = RSVP_PERSON_TYPES.map(({ type, label }) => ({ key: type, label }));

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<RsvpDashboard | null>(null);
  public readonly failed = signal(false);

  /** The event whose people are shown, and them once they are read. */
  public readonly expanded = signal<string | null>(null);
  public readonly people = signal<Array<RsvpDashboardPerson> | null>(null);
  public readonly peopleFailed = signal(false);

  public readonly totals = computed(() => rsvpTotals(this.dashboard()?.events ?? []));
  public readonly expandedEvent = computed(() => this.dashboard()?.events.find((e) => e.guid === this.expanded()) ?? null);
  public readonly rows = computed(() => rsvpRows(this.dashboard()?.events ?? []));
  public readonly series = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? rsvpSeries(dashboard, this.expandedEvent()) : [];
  });
  public readonly daily = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? rsvpDaily(dashboard) : null;
  });
  public readonly bands = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? rsvpBands(dashboard) : [];
  });

  public override ngOnInit(): void {
    super.ngOnInit();

    this.selectedSeason$
      .pipe(
        filter((season) => Boolean(season?.guid)),
        tap(() => {
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

  /** Reads the people of the event the table opened, or forgets them when it closes. */
  public toggle(key: string | null) {
    const event = this.dashboard()?.events.find((e) => e.guid === key);

    if (!event) {
      this.collapse();

      return;
    }

    this.expanded.set(event.guid);
    this.people.set(null);
    this.peopleFailed.set(false);

    this.entityService.getDashboardForEvent(event.guid).subscribe({
      next: (people) => {
        if (this.expanded() === event.guid) {
          this.people.set(people);
        }
      },
      error: () => {
        if (this.expanded() === event.guid) {
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

  public fileName(): string {
    const event = this.expandedEvent();

    return event ? rsvpFileName(event) : 'gisday-rsvps';
  }
}
