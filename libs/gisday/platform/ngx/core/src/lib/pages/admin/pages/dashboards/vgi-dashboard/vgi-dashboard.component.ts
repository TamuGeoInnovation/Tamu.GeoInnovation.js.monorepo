import { Component, computed, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { Season } from '@tamu-gisc/gisday/platform/data-api';
import type { VgiDashboard } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { EventDashboardComponent } from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent } from '../shared/dashboard-people/dashboard-people.component';
import {
  DashboardRowDetailDirective,
  DashboardTableColumn,
  DashboardTableComponent
} from '../shared/dashboard-table/dashboard-table.component';

/** The dashboard table's count columns, beside each feature type's total. */
export const VGI_COLUMNS: Array<DashboardTableColumn> = [
  { key: 'newFinds', label: 'New finds' },
  { key: 'repeats', label: 'Repeats' },
  { key: 'people', label: 'People' },
  { key: 'unverified', label: 'Unverified' },
  { key: 'verified', label: 'Verified' },
  { key: 'discarded', label: 'Discarded' }
];

/** A submitter's own counts, in an opened row and its CSV. */
export const VGI_SUBMITTER_COLUMNS: Array<DashboardTableColumn> = [
  { key: 'submissions', label: 'Submissions' },
  { key: 'newFinds', label: 'New finds' },
  { key: 'repeats', label: 'Repeats' }
];

/**
 * The VGI submissions dashboard (#2894): a season's submissions by the feature type chosen on its form, with how many
 * the leaderboard scores as new finds and as repeats, the people who made them and their review status, how they grew,
 * and, one type at a time, who submitted it, with a CSV. The RSVP and check-in dashboards' page, its rows feature types.
 */
@Component({
  selector: 'tamu-gisc-vgi-dashboard',
  templateUrl: './vgi-dashboard.component.html',
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
export class VgiDashboardComponent extends EventDashboardComponent<VgiDashboard, Season> {
  // Submissions are not a GIS Day entity: the base class is here for its season selector, as on the accounts dashboard.
  protected readonly entityService = inject(SeasonService);
  private readonly submissions = inject(SubmissionService);
  protected readonly filePrefix = 'gisday-vgi-submissions';
  protected readonly comparedNoun = 'submissions';
  protected override readonly seriesLabels = { all: 'All types', one: 'This type' };

  public readonly submitterColumns = VGI_SUBMITTER_COLUMNS;

  public override readonly columns = VGI_COLUMNS;

  /** The columns, the total row counting each person once, whatever types they submitted. */
  public readonly tableColumns = computed(() =>
    this.columns.map((c) => (c.key === 'people' ? { ...c, total: this.dashboard()?.people ?? 0 } : c))
  );

  protected seasonDashboard(seasonGuid: string) {
    return this.submissions.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(type: string) {
    return this.submissions.getDashboardForType(this.dashboard()?.season, type);
  }
}
