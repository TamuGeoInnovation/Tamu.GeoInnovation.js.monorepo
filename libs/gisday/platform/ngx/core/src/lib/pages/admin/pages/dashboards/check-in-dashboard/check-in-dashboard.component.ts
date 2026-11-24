import { Component, computed, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { CheckInDashboard } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import {
  dashboardRows,
  DashboardWords,
  EventDashboardComponent,
  eventsSummary
} from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent, PERSON_TYPE_COLUMNS } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent } from '../shared/dashboard-table/dashboard-table.component';

/**
 * The check-in dashboard (#3006): how many people checked in at each of the season's events, by person type, beside how
 * many RSVP'd, and, for one event at a time, who checked in and when, with a CSV of them. The RSVP dashboard's page
 * over check-ins.
 */
@Component({
  selector: 'tamu-gisc-check-in-dashboard',
  templateUrl: '../shared/event-dashboard/event-dashboard.component.html',
  styleUrls: ['../rsvp-dashboard/rsvp-dashboard.component.scss'],
  imports: [
    SelectComponent,
    LineChartComponent,
    SeasonComparisonComponent,
    DashboardTableComponent,
    DashboardRowDetailDirective,
    DashboardPeopleComponent,
    AsyncPipe
  ]
})
export class CheckInDashboardComponent extends EventDashboardComponent<CheckInDashboard> {
  protected readonly entityService = inject(CheckinService);
  protected readonly filePrefix = 'gisday-check-ins';
  protected readonly comparedNoun = 'check-ins';

  /**
   * After its check-ins, each event's RSVPs, its walk-ins (check-ins with no RSVP), and the share of its RSVPs that showed
   * up (#2893), then the person types.
   */
  public override readonly columns = [
    { key: 'rsvps', label: 'RSVPs' },
    { key: 'walkIns', label: 'Walk-ins' },
    { key: 'showedUp', label: 'Showed up', percentOf: 'rsvps' },
    ...PERSON_TYPE_COLUMNS
  ];

  public override readonly rows = computed(() => {
    const events = this.dashboard()?.events ?? [];

    return dashboardRows(events).map((row, i) => ({
      ...row,
      counts: {
        rsvps: events[i].rsvps,
        walkIns: events[i].walkIns,
        // Those who RSVP'd and checked in: every check-in but the walk-ins.
        showedUp: events[i].total - events[i].walkIns,
        ...row.counts
      }
    }));
  });

  public readonly words: DashboardWords = {
    title: 'Check-ins',
    readError: 'The check-ins could not be read. Try again in a moment.',
    reading: 'Reading the check-ins...',
    overTime: 'Check-ins over time',
    chartNote:
      "The running total at the end of each day, in Central time, with each day's check-ins beneath and the GIS Day week shaded. Hover for a day's numbers; drag across the chart to zoom in, and double-click to see it all again. Press a year to draw it beside this one, lined up on the Monday of each year's GIS Day week: the axis then counts days from it.",
    chartSecondLine: 'The second line is the event opened below.',
    chartOpenOne: 'Open an event below to add its own line.',
    chartUnit: 'check-ins',
    chartLabel: "Check-ins over time, as a running total by day, with each day's check-ins",
    byHeading: 'By event',
    tableNote:
      "Each event's check-ins, with how many RSVP'd beside them. Click a heading to sort by it, and again to reverse it. Click an event to see who checked in.",
    nameLabel: 'Event',
    totalHeading: 'Checked in',
    totalLabel: 'All events',
    dateLabel: 'Checked in',
    emptyText: 'Nobody has checked in at this event yet.',
    noEvents: 'The selected season has no events.'
  };

  public summary(view: CheckInDashboard, total: number): string {
    return eventsSummary(total, view.events.length, view.unreadAccounts, { one: 'check-in', many: 'check-ins' }, 'at');
  }

  protected seasonDashboard(seasonGuid: string) {
    return this.entityService.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(eventGuid: string) {
    return this.entityService.getDashboardForEvent(eventGuid);
  }
}
