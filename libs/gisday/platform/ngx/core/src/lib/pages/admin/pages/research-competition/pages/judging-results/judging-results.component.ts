import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import * as Papa from 'papaparse';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { downloadFile } from '@tamu-gisc/common/utils/ui';
import { serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import { JUDGED_COMPETITIONS, JudgingResultsDto, judgingResultsTable } from '@tamu-gisc/gisday/common';

import { seasonChoice } from '../../components/season-choice';

/** A competition's results as a CSV file, as the page shows them. */
export function judgingResultsCsv(results: JudgingResultsDto): string {
  return Papa.unparse(judgingResultsTable(results));
}

/**
 * A competition's judging results (#3183), for the admins (decided 5A): a row per accepted submission, highest average
 * first, with each judge's total, how many judged it, the average of their totals and each criterion's average
 * (decided 6A); each judge's progress; and the same as a CSV file.
 */
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
  public readonly problem = signal<string | null>(null);

  constructor() {
    effect(() => {
      const season = this.choice.season();
      const competition = this.competition();

      if (season && competition) {
        this.load(season.guid, competition);
      }
    });
  }

  public chooseCompetition(value: unknown): void {
    if (typeof value === 'string' && value) {
      this.competition.set(value);
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
