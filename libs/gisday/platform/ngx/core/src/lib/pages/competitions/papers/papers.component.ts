import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SeasonCompetitions, SubmissionDeadlines, closesAt, finalistsNotifiedAt, inCentralTime } from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { CompetitionSessionComponent } from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PapersComponent {
  /** The active season: its paper deadline and when its finalists hear (#3321), as the Posters page reads its own. */
  public readonly season = toSignal(inject(SeasonService).activeSeason$, { initialValue: null });

  /** When finalists hear (#3321): the season's, for the Paper competition, in Central time, or null to leave the line out. */
  public readonly finalistsNotified = computed(() => {
    const at = finalistsNotifiedAt(this.season() as SeasonCompetitions, 'paper');

    return at ? inCentralTime(at) : null;
  });

  /** When papers are due: the season's paper submission deadline (#2962, #3321), in Central time. */
  public readonly submissionsDue = computed(() => {
    const due = closesAt(this.season() as SubmissionDeadlines, 'paper', 'submissions');

    return due ? inCentralTime(due) : null;
  });
}
