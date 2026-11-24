import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import {
  SeasonCompetitions,
  SubmissionDeadlines,
  closesAt,
  finalistsNotifiedAt,
  inCentralTime
} from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import {
  CompetitionSessionComponent,
  CompetitionSessionsService,
  competitionDays
} from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PresentationComponent {
  /** The active season: its deadlines, and the sessions and finalists date it chose (#3019). */
  public readonly season = toSignal(inject(SeasonService).activeSeason$, { initialValue: null });
  private readonly sessions = toSignal(inject(CompetitionSessionsService).sessions$, { initialValue: null });

  /** The heading's day: the competition sessions' own (#3019), not typed in for one year. */
  public readonly day = computed(() =>
    competitionDays(this.sessions(), ['undergraduate', 'graduate'], this.season() as SeasonCompetitions)
  );

  /** When finalists hear (#3019, 7A): the season's, in Central time, or null to leave the line out. */
  public readonly finalistsNotified = computed(() => {
    const at = finalistsNotifiedAt(this.season() as SeasonCompetitions, 'presentation');

    return at ? inCentralTime(at) : null;
  });

  /** When abstracts are due: the season's presentation submission deadline (#2934, #3019), in Central time. */
  public readonly submissionsDue = computed(() => {
    const due = closesAt(this.season() as SubmissionDeadlines, 'presentation', 'submissions');

    return due ? inCentralTime(due) : null;
  });

  /**
   * When finalists' slides are due (#3015): the season's own presentation file deadline, the one the site enforces, in
   * Central time. Null when none is set.
   */
  public readonly slidesDue = computed(() => {
    const due = closesAt(this.season() as SubmissionDeadlines, 'presentation', 'files');

    return due ? inCentralTime(due) : null;
  });
}
