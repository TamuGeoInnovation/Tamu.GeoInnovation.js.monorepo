import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, DatePipe } from '@angular/common';
import { catchError, filter, of, switchMap, tap } from 'rxjs';

import * as Papa from 'papaparse';

import { RSVP_PERSON_TYPES, RsvpPersonType, RsvpPersonTypeCounts } from '@tamu-gisc/gisday/common';
import type {
  RsvpDashboard,
  RsvpDashboardEvent,
  RsvpDashboardPerson,
  UserRsvp
} from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { bandOfDays, ChartBand, ChartSeries, countsByDay, dayIn, LineChartComponent, runningTotalByDay } from '@tamu-gisc/ui-kits/ngx/charts';
import { downloadFile, fileNamePart } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

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

/** The people under their type's heading, in the dashboard's order of types, each group by last name. */
export function groupPeople(
  people: Array<RsvpDashboardPerson>
): Array<{ type: RsvpPersonType; label: string; people: Array<RsvpDashboardPerson> }> {
  const name = (p: RsvpDashboardPerson) => `${p.lastName ?? ''} ${p.firstName ?? ''} ${p.email ?? ''}`.trim().toLowerCase();

  return RSVP_PERSON_TYPES.map(({ type, label }) => ({
    type,
    label,
    people: people.filter((p) => p.type === type).sort((a, b) => name(a).localeCompare(name(b)))
  })).filter((group) => group.people.length > 0);
}

/** One event's people as a CSV, one row each, grouped as the page shows them. */
export function rsvpCsv(people: Array<RsvpDashboardPerson>): string {
  const rows = groupPeople(people).flatMap((group) =>
    group.people.map((p) => ({
      'Last name': p.lastName ?? '',
      'First name': p.firstName ?? '',
      Email: p.email ?? '',
      'Person type': group.label,
      Classification: p.classification ?? '',
      Position: p.position ?? '',
      'Department / field of study': p.department ?? '',
      'University / employer': p.organization ?? '',
      "RSVP'd": p.created
    }))
  );

  return Papa.unparse(rows, {
    columns: [
      'Last name',
      'First name',
      'Email',
      'Person type',
      'Classification',
      'Position',
      'Department / field of study',
      'University / employer',
      "RSVP'd"
    ]
  });
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
  return { label: 'New per day', points: countsByDay(dashboard.made.map((m) => m.created)) };
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
  imports: [SelectComponent, LineChartComponent, AsyncPipe, DatePipe]
})
export class RsvpDashboardComponent extends BaseAdminListComponent<UserRsvp> implements OnInit {
  protected readonly entityService = inject(RsvpService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly types = RSVP_PERSON_TYPES;

  /** The season's dashboard, null while it loads, and `failed` if it could not be read. */
  public readonly dashboard = signal<RsvpDashboard | null>(null);
  public readonly failed = signal(false);

  /** The event whose people are shown, and them once they are read. */
  public readonly expanded = signal<string | null>(null);
  public readonly people = signal<Array<RsvpDashboardPerson> | null>(null);
  public readonly peopleFailed = signal(false);

  public readonly totals = computed(() => rsvpTotals(this.dashboard()?.events ?? []));
  public readonly expandedEvent = computed(() => this.dashboard()?.events.find((e) => e.guid === this.expanded()) ?? null);
  public readonly groups = computed(() => groupPeople(this.people() ?? []));
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

  /** Opens an event's people, or closes them if they are open. */
  public toggle(event: RsvpDashboardEvent) {
    if (this.expanded() === event.guid) {
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

  /** A student's group shows classification, field of study and university; anyone else's, position, department and employer. */
  public isStudent(type: RsvpPersonType): boolean {
    return type === 'undergraduate' || type === 'graduate' || type === 'student';
  }

  public collapse() {
    this.expanded.set(null);
    this.people.set(null);
    this.peopleFailed.set(false);
  }

  public download(event: RsvpDashboardEvent) {
    const people = this.people();

    if (!people) {
      return;
    }

    const name = [fileNamePart(event.name ?? 'event'), event.starts ? dayIn(new Date(event.starts), 'America/Chicago') : null]
      .filter(Boolean)
      .join('-');

    downloadFile(rsvpCsv(people), `gisday-rsvps-${name}.csv`, 'text/csv');
  }
}
