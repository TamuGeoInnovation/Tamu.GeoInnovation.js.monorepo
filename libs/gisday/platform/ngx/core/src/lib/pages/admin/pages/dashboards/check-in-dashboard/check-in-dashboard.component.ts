import { Component, computed, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { CheckIn, CheckInDashboard } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { dashboardRows, EventDashboardComponent } from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent, PERSON_TYPE_COLUMNS } from '../shared/dashboard-people/dashboard-people.component';
import { DashboardRowDetailDirective, DashboardTableComponent } from '../shared/dashboard-table/dashboard-table.component';

/**
 * The check-in dashboard (#3006): how many people checked in at each of the season's events, by person type, beside how
 * many RSVP'd, and, for one event at a time, who checked in and when, with a CSV of them. The RSVP dashboard's page
 * over check-ins.
 */
@Component({
  selector: 'tamu-gisc-check-in-dashboard',
  templateUrl: './check-in-dashboard.component.html',
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
export class CheckInDashboardComponent extends EventDashboardComponent<CheckInDashboard, CheckIn> {
  protected readonly entityService = inject(CheckinService);
  protected readonly filePrefix = 'gisday-check-ins';
  protected readonly comparedNoun = 'check-ins';

  /** Each event's RSVPs in the column after its check-ins, then the person types. */
  public override readonly columns = [{ key: 'rsvps', label: 'RSVPs' }, ...PERSON_TYPE_COLUMNS];

  public override readonly rows = computed(() => {
    const events = this.dashboard()?.events ?? [];

    return dashboardRows(events).map((row, i) => ({ ...row, counts: { rsvps: events[i].rsvps, ...row.counts } }));
  });

  protected seasonDashboard(seasonGuid: string) {
    return this.entityService.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(eventGuid: string) {
    return this.entityService.getDashboardForEvent(eventGuid);
  }
}
