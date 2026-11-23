import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { RsvpDashboard, UserRsvp } from '@tamu-gisc/gisday/platform/data-api';
import { RsvpService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { EventDashboardComponent } from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent } from '../shared/dashboard-table/dashboard-table.component';

/**
 * The RSVP dashboard (#2878): how many people have RSVP'd for each of the season's events, by person type, how that
 * has grown over time, and, for one event at a time, who they are, with a CSV of them.
 */
@Component({
  selector: 'tamu-gisc-rsvp-dashboard',
  templateUrl: './rsvp-dashboard.component.html',
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
export class RsvpDashboardComponent extends EventDashboardComponent<RsvpDashboard, UserRsvp> {
  protected readonly entityService = inject(RsvpService);
  protected readonly filePrefix = 'gisday-rsvps';
  protected readonly comparedNoun = 'RSVPs';

  protected seasonDashboard(seasonGuid: string) {
    return this.entityService.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(eventGuid: string) {
    return this.entityService.getDashboardForEvent(eventGuid);
  }
}
