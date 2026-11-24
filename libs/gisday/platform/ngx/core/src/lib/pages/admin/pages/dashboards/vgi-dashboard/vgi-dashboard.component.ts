import { Component, computed, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import type { Season } from '@tamu-gisc/gisday/platform/data-api';
import type { VgiDashboard } from '@tamu-gisc/gisday/competitions/data-api/types';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { LineChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { SeasonComparisonComponent } from '../shared/season-comparison/season-comparison.component';
import { DashboardWords, EventDashboardComponent } from '../shared/event-dashboard/event-dashboard.component';
import { DashboardPeopleComponent } from '../shared/dashboard-people/dashboard-people.component';
import {
  DashboardRowDetailDirective,
  DashboardTableColumn,
  DashboardTableComponent
} from '../shared/dashboard-table/dashboard-table.component';

/**
 * The dashboard table's count columns, beside each feature type's total. "Unverified" and "Discarded" are wider than a
 * count column at its narrowest, so each carries a soft hyphen, shown only if it must break (#3219).
 */
export const VGI_COLUMNS: Array<DashboardTableColumn> = [
  { key: 'newFinds', label: 'New finds' },
  { key: 'repeats', label: 'Repeats' },
  { key: 'people', label: 'People' },
  { key: 'unverified', label: 'Un\u00adverified' },
  { key: 'verified', label: 'Verified' },
  { key: 'discarded', label: 'Dis\u00adcarded' }
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
export class VgiDashboardComponent extends EventDashboardComponent<VgiDashboard, Season> {
  // Submissions are not a GIS Day entity: the base class is here for its season selector, as on the accounts dashboard.
  protected readonly entityService = inject(SeasonService);
  private readonly submissions = inject(SubmissionService);
  protected readonly filePrefix = 'gisday-vgi-submissions';
  protected readonly comparedNoun = 'submissions';
  protected override readonly seriesLabels = { all: 'All types', one: 'This type' };

  public override readonly countColumns = VGI_SUBMITTER_COLUMNS;

  public override readonly columns = VGI_COLUMNS;

  /** The columns, the total row counting each person once, whatever types they submitted. */
  public override readonly tableColumns = computed(() =>
    this.columns.map((c) => (c.key === 'people' ? { ...c, total: this.dashboard()?.people ?? 0 } : c))
  );

  public readonly words: DashboardWords = {
    title: 'VGI submissions',
    readError: 'The submissions could not be read. Try again in a moment.',
    reading: 'Reading the submissions...',
    overTime: 'Submissions over time',
    chartNote:
      "The running total at the end of each day, in Central time, with each day's submissions beneath. Hover for a day's numbers; drag across the chart to zoom in, and double-click to see it all again. Press a year to draw it beside this one, lined up on the Monday of each year's GIS Day week: the axis then counts days from it.",
    chartSecondLine: 'The second line is the feature type opened below.',
    chartOpenOne: 'Open a feature type below to add its own line.',
    chartUnit: 'submissions',
    chartLabel: "Submissions over time, as a running total by day, with each day's submissions",
    byHeading: 'By feature type',
    tableNote:
      "Each feature type on the season's form. New finds and repeats are scored as the leaderboard scores them; a discarded submission, or one outside the scoring window, is neither. Click a heading to sort by it, and again to reverse it. Click a feature type to see who submitted it.",
    nameLabel: 'Feature type',
    // "Sub-missions", with a soft hyphen: at its narrowest the total column cut the word to "Submissio", and
    // Chrome does not hyphenate a word starting with a capital.
    totalHeading: 'Sub\u00admissions',
    totalLabel: 'All types',
    dateLabel: 'First submitted',
    emptyText: 'Nobody has submitted this feature type yet.',
    noEvents: 'The selected season has no VGI competition form, or its form has no feature types.'
  };

  public summary(view: VgiDashboard, total: number): string {
    const types = view.events.length;

    return `${total === 1 ? 'submission' : 'submissions'} of ${types} ${types === 1 ? 'feature type' : 'feature types'}, by ${view.people} ${view.people === 1 ? 'person' : 'people'}.`;
  }

  protected seasonDashboard(seasonGuid: string) {
    return this.submissions.getDashboardForSeason(seasonGuid);
  }

  protected eventPeople(type: string) {
    return this.submissions.getDashboardForType(this.dashboard()?.season, type);
  }
}
