import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { GISDAY_TIME_ZONE } from '@tamu-gisc/gisday/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { readRefusal, seasonPicker } from '@tamu-gisc/gisday/platform/ngx/common';

import type { RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { bandOfDays, ChartBand, ChartSeries, countsByDay, dayIn, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { fileNamePart } from '@tamu-gisc/common/utils/ui';

import { PERSON_TYPE_COLUMNS } from '../dashboard-people/dashboard-people.component';
import { DashboardTableColumn, DashboardTableRow } from '../dashboard-table/dashboard-table.component';
import { SeasonComparison } from '../season-comparison/season-comparison';

/**
 * One row of an event dashboard: an event (RSVPs, check-ins), or anything counted like one, such as a VGI feature type
 * (#2894), which has no time or place.
 */
export interface DashboardItem {
  guid: string;
  name: string | null;
  starts: string | null;
  location?: string | null;
  total: number;
  counts: Record<string, number>;
}

/** What an event dashboard draws: its rows, and when each record counted was made, by the row it counts in. */
export interface DashboardData {
  events: Array<DashboardItem>;
  made: Array<{ event: string; created: string }>;
}

/** Each count summed over `events`, and the total, for the table's last row. */
export function dashboardTotals(events: Array<DashboardItem>): { total: number; counts: Record<string, number> } {
  const counts: Record<string, number> = {};

  for (const event of events) {
    for (const [key, n] of Object.entries(event.counts)) {
      counts[key] = (counts[key] ?? 0) + n;
    }
  }

  return { total: events.reduce((sum, e) => sum + e.total, 0), counts };
}

/** The table's rows: each event, its venue under its name, its start in its own column, and its counts by type. */
export function dashboardRows(events: Array<DashboardItem>): Array<DashboardTableRow> {
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
export function dashboardFileName(prefix: string, event: DashboardItem): string {
  const name = [fileNamePart(event.name ?? 'event'), event.starts ? dayIn(new Date(event.starts), GISDAY_TIME_ZONE) : null]
    .filter(Boolean)
    .join('-');

  return `${prefix}-${name}`;
}

/** The chart's lines: every event's records as a running total by day, and the expanded event's own, if one is. */
export function dashboardSeries(
  dashboard: DashboardData,
  expanded: DashboardItem | null,
  labels = { all: 'All events', one: 'This event' }
): Array<ChartSeries> {
  const series: Array<ChartSeries> = [
    { label: labels.all, points: runningTotalByDay(dashboard.made.map((m) => m.created)) }
  ];

  if (expanded) {
    series.push({
      label: expanded.name ?? labels.one,
      points: runningTotalByDay(dashboard.made.filter((m) => m.event === expanded.guid).map((m) => m.created))
    });
  }

  return series;
}

/** The columns under the chart: how many records every event gained each day (#2886). */
export function dashboardDaily(dashboard: DashboardData): ChartSeries {
  return { label: 'New that day', points: countsByDay(dashboard.made.map((m) => m.created)) };
}

/** The days the season's events run, shaded on the chart. */
export function dashboardBands(dashboard: DashboardData): Array<ChartBand> {
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
export abstract class EventDashboardComponent<D extends DashboardData> implements OnInit {
  /** The season shown, from the address (#3329). */
  private readonly picker = seasonPicker();
  public readonly seasons$ = this.picker.seasons$;
  public readonly selectedSeason$ = this.picker.season$;

  private readonly destroyRef = inject(DestroyRef);

  /** The start of each event's CSV file name, such as gisday-rsvps. */
  protected abstract readonly filePrefix: string;
  protected abstract seasonDashboard(seasonGuid: string): Observable<D>;
  protected abstract eventPeople(eventGuid: string): Observable<Array<RsvpDashboardPerson>>;

  public readonly columns: Array<DashboardTableColumn> = PERSON_TYPE_COLUMNS;

  /** The chart's line of every row, and its name for an opened row with no name. */
  protected readonly seriesLabels = { all: 'All events', one: 'This event' };
  /** What the chart counts, for a year button that cannot be pressed: "2023 has no RSVPs." */
  protected abstract readonly comparedNoun: string;

  /** The earlier seasons beside this one on the chart (#3215), once the page knows its seasons. */
  public readonly comparison = signal<SeasonComparison | null>(null);

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<D | null>(null);
  public readonly failed = signal(false);
  /** Why it could not be read, when trying again won't help: a missing permission or an expired sign-in (#3038). */
  public readonly refusal = signal<string | null>(null);

  /** The event whose people are shown, and them once they are read. */
  public readonly expanded = signal<string | null>(null);
  public readonly people = signal<Array<RsvpDashboardPerson> | null>(null);
  public readonly peopleFailed = signal(false);

  public readonly totals = computed(() => dashboardTotals(this.dashboard()?.events ?? []));
  public readonly expandedEvent = computed(() => this.dashboard()?.events.find((e) => e.guid === this.expanded()) ?? null);
  public readonly rows = computed(() => dashboardRows(this.dashboard()?.events ?? []));
  public readonly series = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardSeries(dashboard, this.expandedEvent(), this.seriesLabels) : [];
  });
  /** The chart's lines with the compared seasons', and the day its axis counts from when there are any. */
  public readonly chart = computed(() => this.comparison()?.compare(this.series()) ?? { series: this.series(), anchor: null });
  public readonly daily = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardDaily(dashboard) : null;
  });
  public readonly bands = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? dashboardBands(dashboard) : [];
  });

  public setSeason(seasonGuid: string) {
    this.picker.choose(seasonGuid);
  }

  public ngOnInit(): void {
    this.comparison.set(
      new SeasonComparison(
        (guid) => this.seasonDashboard(guid).pipe(map((d) => d.made.map((m) => m.created))),
        this.seasons$,
        this.selectedSeason$,
        this.destroyRef,
        this.comparedNoun
      )
    );

    this.selectedSeason$
      .pipe(
        filter((season) => Boolean(season?.guid)),
        tap(() => {
          this.dashboard.set(null);
          this.failed.set(false);
          this.refusal.set(null);
          this.collapse();
        }),
        switchMap((season) =>
          this.seasonDashboard(season.guid).pipe(
            catchError((err) => {
              this.failed.set(true);
              this.refusal.set(readRefusal(err));

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
