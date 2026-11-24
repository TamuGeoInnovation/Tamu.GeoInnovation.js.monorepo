import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { RsvpDashboard } from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { DashboardWords, EventDashboardComponent, eventsSummary } from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent } from '../shared/dashboard-table/dashboard-table.component';

/**
 * The RSVP dashboard (#2878): how many people have RSVP'd for each of the season's events, by person type, how that
 * has grown over time, and, for one event at a time, who they are, with a CSV of them.
 */
@Component({
  selector: 'tamu-gisc-rsvp-dashboard',
  templateUrl: '../shared/event-dashboard/event-dashboard.component.html',
  styleUrls: ['./rsvp-dashboard.component.scss'],
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
export class RsvpDashboardComponent extends EventDashboardComponent<RsvpDashboard> {
  protected readonly entityService = inject(RsvpService);
  protected readonly filePrefix = 'gisday-rsvps';
  protected readonly comparedNoun = 'RSVPs';

  public readonly words: DashboardWords = {
    title: 'RSVPs',
    readError: 'The RSVPs could not be read. Try again in a moment.',
    reading: 'Reading the RSVPs...',
    overTime: 'RSVPs over time',
    chartNote:
      "The running total at the end of each day, in Central time, with each day's new RSVPs beneath and the GIS Day week shaded. Hover for a day's numbers; drag across the chart to zoom in, and double-click to see it all again. Press a year to draw it beside this one, lined up on the Monday of each year's GIS Day week: the axis then counts days from it.",
    chartSecondLine: 'The second line is the event opened below.',
    chartOpenOne: 'Open an event below to add its own line.',
    chartUnit: 'RSVPs',
    chartLabel: "RSVPs over time, as a running total by day, with each day's new RSVPs",
    byHeading: 'By event',
    tableNote: "Click a heading to sort by it, and again to reverse it. Click an event to see who RSVP'd.",
    nameLabel: 'Event',
    totalHeading: 'Total',
    totalLabel: 'All events',
    dateLabel: "RSVP'd",
    emptyText: "Nobody has RSVP'd for this event yet.",
    noEvents: 'The selected season has no events.'
  };

  public summary(view: RsvpDashboard, total: number): string {
    return eventsSummary(total, view.events.length, view.unreadAccounts, { one: 'RSVP', many: 'RSVPs' }, 'for');
  }

  protected seasonDashboard(seasonGuid: string) {
    return this.entityService.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(eventGuid: string) {
    return this.entityService.getDashboardForEvent(eventGuid);
  }
}
