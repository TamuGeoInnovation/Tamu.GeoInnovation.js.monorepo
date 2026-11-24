import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SubmissionDeadlines, closesAt, inCentralTime } from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import {
  CompetitionSessionComponent,
  CompetitionSessionsService,
  competitionDays
} from '../competition-session/competition-session.component';

@Component({
  selector: 'tamu-gisc-posters',
  templateUrl: './posters.component.html',
  styleUrls: ['./posters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, CompetitionSessionComponent]
})
export class PostersComponent {
  private readonly season = toSignal(inject(SeasonService).activeSeason$, { initialValue: null });
  private readonly sessions = toSignal(inject(CompetitionSessionsService).sessions$, { initialValue: null });

  /** The poster session's day, for the heading and the finalists (#3019), not typed in for one year. */
  public readonly day = computed(() => competitionDays(this.sessions(), ['poster']));

  /** When posters are due: the season's poster submission deadline (#2934, #3019), in Central time. */
  public readonly submissionsDue = computed(() => {
    const due = closesAt(this.season() as SubmissionDeadlines, 'poster', 'submissions');

    return due ? inCentralTime(due) : null;
  });
}
