import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { downloadFile, toCsv } from '@tamu-gisc/common/utils/ui';
import { serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  JUDGED_COMPETITIONS,
  JudgeBreakdownLine,
  JudgingResultRow,
  JudgingResultsDto,
  NOT_SCORED_YET,
  everyScoreTable,
  judgeBreakdown,
  judgingResultsTable
} from '@tamu-gisc/gisday/common';

import { seasonChoice } from '../../components/season-choice';

/** A competition's results as a CSV file, as the page shows them. */
export function judgingResultsCsv(results: JudgingResultsDto): string {
  const { fields, data } = judgingResultsTable(results);

  return toCsv(fields, data);
}

/**
 * Every score as a CSV file (#3193): a row per judge per entry. Papa's writer quotes a comment with a comma, a quote or a
 * line break in it, as it does the results' file.
 */
export function everyScoreCsv(results: JudgingResultsDto): string {
  const { fields, data } = everyScoreTable(results);

  return toCsv(fields, data);
}

/**
 * A competition's judging results (#3183), for the admins (decided 5A): a row per accepted submission, highest average
 * first, with each judge's total, how many judged it, the average of their totals and each criterion's average
 * (decided 6A); each judge's progress; and the same as a CSV file.
 */
/** The fixed columns' widths, in pixels: the table's columns and its whole width both read them. */
export const RESULTS_COLUMN_WIDTHS = { rank: 60, title: 220, judges: 80, average: 130 } as const;

@Component({
  selector: 'tamu-gisc-judging-results',
  templateUrl: './judging-results.component.html',
  styleUrls: ['./judging-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxDatatableModule, SelectComponent]
})
export class JudgingResultsComponent {
  private readonly judging = inject(JudgingService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly choice = seasonChoice();
  public readonly competitions = JUDGED_COMPETITIONS.map((row) => ({ name: row.label, value: row.competition }));
  public readonly competition = signal<string>(JUDGED_COMPETITIONS[0].competition);
  public readonly results = signal<JudgingResultsDto | null>(null);
  public readonly widths = RESULTS_COLUMN_WIDTHS;
  public readonly problem = signal<string | null>(null);
  public readonly notScoredYet = NOT_SCORED_YET;
  /** The entry whose breakdown is open (#3193), by its id, or null. */
  public readonly opened = signal<string | null>(null);
  private readonly table = viewChild(DatatableComponent);

  constructor() {
    effect(() => {
      const season = this.choice.season();
      const competition = this.competition();

      if (season && competition) {
        this.load(season.guid, competition);
      }
    });
  }

  /** A column as wide as its heading, whole: a judge's name or a criterion's, at the table's heading size. */
  public columnWidth(heading: string): number {
    return Math.max(110, Math.ceil(heading.length * 8.5) + 32);
  }

  /**
   * The table's whole width: every column at its own width added up. Set on the table, as the submissions list sets its
   * narrowest (#3026), so the table is wider than its box and the box scrolls; ngx-datatable clips anything past its own
   * width, so without it the criterion columns could not be reached (lab, batch 123).
   */
  public tableWidth(results: Pick<JudgingResultsDto, 'judges' | 'rubric'>): number {
    const fixed =
      RESULTS_COLUMN_WIDTHS.rank +
      RESULTS_COLUMN_WIDTHS.title +
      RESULTS_COLUMN_WIDTHS.judges +
      RESULTS_COLUMN_WIDTHS.average;
    const judges = results.judges.reduce((sum, judge) => sum + this.columnWidth(judge.name), 0);
    const criteria = (results.rubric?.criteria ?? []).reduce(
      (sum, criterion) => sum + this.columnWidth(`${criterion.name} (of ${criterion.maxPoints})`),
      0
    );

    return fixed + judges + criteria;
  }

  public chooseCompetition(value: unknown): void {
    if (typeof value === 'string' && value) {
      this.competition.set(value);
    }
  }

  /** One entry's breakdown: a line per judge, with their score on each criterion, their total and comment (#3193). */
  public breakdown(results: JudgingResultsDto, row: JudgingResultRow): Array<JudgeBreakdownLine> {
    return judgeBreakdown(results, row);
  }

  /** A click on a row, or Enter or Space on it, opens its breakdown, as the dashboards' tables open theirs. */
  public onActivate(event: { type: string; row: JudgingResultRow; event: Event }): void {
    const key = event.event instanceof KeyboardEvent ? event.event.key : null;

    if (event.type === 'click' || key === 'Enter' || key === ' ') {
      this.toggle(event.row);
    }
  }

  /** Opens an entry's breakdown, closing any other, or closes it if it is open. */
  public toggle(row: JudgingResultRow): void {
    const detail = this.table()?.rowDetail;
    const closing = this.opened() === row.guid;

    detail?.collapseAllRows();

    if (closing) {
      this.opened.set(null);
    } else {
      detail?.toggleExpandRow(row);
      this.opened.set(row.guid);
    }
  }

  /** Every score, a row per judge per entry, as a CSV file (#3193). */
  public downloadEveryScore(): void {
    const results = this.results();
    const year = this.choice.season()?.year;

    if (results) {
      downloadFile(
        everyScoreCsv(results),
        `judging-${results.competition}-every-score${year ? `-${year}` : ''}.csv`,
        'text/csv'
      );
    }
  }

  public download(): void {
    const results = this.results();
    const year = this.choice.season()?.year;

    if (results) {
      downloadFile(judgingResultsCsv(results), `judging-${results.competition}${year ? `-${year}` : ''}.csv`, 'text/csv');
    }
  }

  private load(season: string, competition: string): void {
    this.results.set(null);
    this.opened.set(null);
    this.problem.set(null);
    this.judging
      .results(season, competition)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => this.results.set(results),
        error: (err) => this.problem.set(serverMessage(err, 'The results could not be loaded.'))
      });
  }
}
