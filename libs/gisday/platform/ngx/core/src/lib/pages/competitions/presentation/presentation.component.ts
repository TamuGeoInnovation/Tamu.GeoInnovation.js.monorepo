import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SubmissionDeadlines, closesAt, inCentralTime } from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { CompetitionSessionComponent } from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PresentationComponent {
  private readonly season = toSignal(inject(SeasonService).activeSeason$, { initialValue: null });

  /**
   * When finalists' slides are due (#3015): the season's own presentation file deadline, the one the site enforces, in
   * Central time. Null when none is set.
   */
  public readonly slidesDue = computed(() => {
    const due = closesAt(this.season() as SubmissionDeadlines, 'presentation', 'files');

    return due ? inCentralTime(due) : null;
  });
}
