import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, filter, of, switchMap, tap } from 'rxjs';

import { RSVP_PERSON_TYPES, RsvpPersonTypeCounts } from '@tamu-gisc/gisday/common';
import type {
  GuidIdentity,
  RsvpDashboard,
  RsvpDashboardEvent,
  RsvpDashboardPerson
} from '@tamu-gisc/gisday/platform/data-api';
import { bandOfDays, ChartBand, ChartSeries, countsByDay, dayIn, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { fileNamePart } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { PERSON_TYPE_COLUMNS } from '../dashboard-people/dashboard-people.component';
import { DashboardTableRow } from '../dashboard-table/dashboard-table.component';

/** Every type's count summed over `events`, and the total, for the table's last row. */
export function dashboardTotals(events: Array<RsvpDashboardEvent>): { total: number; counts: RsvpPersonTypeCounts } {
  const counts = Object.fromEntries(RSVP_PERSON_TYPES.map(({ type }) => [type, 0])) as RsvpPersonTypeCounts;

  for (const event of events) {
    for (const { type } of RSVP_PERSON_TYPES) {
      counts[type] += event.counts[type];
    }
  }

  return { total: events.reduce((sum, e) => sum + e.total, 0), counts };
}

/** The table's rows: each event, its venue under its name, its start in its own column, and its counts by type. */
export function dashboardRows(events: Array<RsvpDashboardEvent>): Array<DashboardTableRow> {
  return events.map((e) => ({
    key: e.guid,
    name: e.name ?? 'Untitled event',
    note: e.location,
    when: e.starts,
    total: e.total,
    counts: e.counts
  }));
}

/** An event's CSV file name: its name and day, as <prefix>-<name>-<day>. */
export function dashboardFileName(prefix: string, event: RsvpDashboardEvent): string {
  const name = [fileNamePart(event.name ?? 'event'), event.starts ? dayIn(new Date(event.starts), 'America/Chicago') : null]
    .filter(Boolean)
    .join('-');

  return `${prefix}-${name}`;
}

/** The chart's lines: every event's records as a running total by day, and the expanded event's own, if one is. */
export function dashboardSeries(dashboard: RsvpDashboard, expanded: RsvpDashboardEvent | null): Array<ChartSeries> {
  const series: Array<ChartSeries> = [
    { label: 'All events', points: runningTotalByDay(dashboard.made.map((m) => m.created)) }
  ];

  if (expanded) {
    series.push({
      label: expanded.name ?? 'This event',
      points: runningTotalByDay(dashboard.made.filter((m) => m.event === expanded.guid).map((m) => m.created))
    });
  }

  return series;
}

/** The columns under the chart: how many records every event gained each day (#2886). */
export function dashboardDaily(dashboard: RsvpDashboard): ChartSeries {
  return { label: 'New that day', points: countsByDay(dashboard.made.map((m) => m.created)) };
}

/** The days the season's events run, shaded on the chart. */
export function dashboardBands(dashboard: RsvpDashboard): Array<ChartBand> {
  const band = bandOfDays(
    dashboard.events.map((e) => e.starts).filter((s): s is string => Boolean(s)),
    'GIS Day week'
  );

  return band ? [band] : [];
}

/**
 * A dashboard of a season's events (#2878, #3006): how many of something (RSVPs, check-ins) each event has, by person
 * type, how that grew over time, and, for one event at a time, who they are, with a CSV of them. The API lists only the
 * site's own events (#2986, #3024). A page names where its season and its people come from, and its CSV's prefix; the
 * table, people and chart are shared components.
 */
@Component({ selector: 'tamu-gisc-event-dashboard', template: '', standalone: false })
export abstract class EventDashboardComponent<D extends RsvpDashboard, E extends GuidIdentity>
  extends BaseAdminListComponent<E>
  implements OnInit
{
  private readonly destroyRef = inject(DestroyRef);

  /** The start of each event's CSV file name, such as gisday-rsvps. */
  protected abstract readonly filePrefix: string;
  protected abstract seasonDashboard(seasonGuid: string): Observable<D>;
  protected abstract eventPeople(eventGuid: string): Observable<Array<RsvpDashboardPerson>>;

  public readonly columns = PERSON_TYPE_COLUMNS;

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<D | null>(null);
  public readonly failed = signal(false);

  /** The event whose people are shown, and them once they are read. */
  public readonly expanded = signal<string | null>(null);
  public readonly people = signal<Array<RsvpDashboardPerson> | null>(null);
  public readonly peopleFailed = signal(false);

  public readonly totals = computed(() => dashboardTotals(this.dashboard()?.events ?? []));
  public readonly expandedEvent = computed(() => this.dashboard()?.events.find((e) => e.guid === this.expanded()) ?? null);
  public readonly rows = computed(() => dashboardRows(this.dashboard()?.events ?? []));
  public readonly series = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardSeries(dashboard, this.expandedEvent()) : [];
  });
  public readonly daily = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardDaily(dashboard) : null;
  });
  public readonly bands = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardBands(dashboard) : [];
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
          this.seasonDashboard(season.guid).pipe(
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

    this.eventPeople(event.guid).subscribe({
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

    return event ? dashboardFileName(this.filePrefix, event) : this.filePrefix;
  }
}
