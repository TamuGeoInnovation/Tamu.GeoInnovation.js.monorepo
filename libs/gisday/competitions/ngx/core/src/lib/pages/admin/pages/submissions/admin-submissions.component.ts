import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, shareReplay } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { LeaderboardService, SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';
import { SubmissionReviewListComponent } from '../../../shared/submission-review-list/submission-review-list.component';

/**
 * Which submissions the page lists (#2164): all of them; those the app left for a person (still
 * unverified); or the top finishers', checked before prizes are awarded.
 */
export type AdminSubmissionsView = 'all' | 'needs-a-look' | 'top-finishers';

/**
 * How many places the prizes go to. Everyone tied with the last of them is a top finisher too.
 */
export const PRIZE_PLACES = 3;

@Component({
  selector: 'tamu-gisc-admin-submissions',
  templateUrl: './admin-submissions.component.html',
  styleUrls: ['./admin-submissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SubmissionReviewListComponent, AsyncPipe]
})
export class AdminSubmissionsComponent implements OnInit {
  private readonly submissionService = inject(SubmissionService);
  private readonly leaderboardService = inject(LeaderboardService);

  public readonly view$ = new BehaviorSubject<AdminSubmissionsView>('all');

  public submissions$: Observable<SubmissionReviewDto[]>;

  public ngOnInit(): void {
    const all$ = this.submissionService.getAdminSubmissions().pipe(shareReplay(1));
    const topFinishers$ = this.leaderboardService.getScoresForActive().pipe(
      map((scores) => {
        const ranked = [...scores].sort((a, b) => b.points - a.points);
        const cutOff = ranked[Math.min(PRIZE_PLACES, ranked.length) - 1]?.points;

        return new Set(ranked.filter((score) => cutOff !== undefined && score.points >= cutOff).map((score) => score.guid));
      }),
      // Without a leaderboard there are no top finishers to show; the other views still work.
      catchError(() => of(new Set<string>())),
      shareReplay(1)
    );

    this.submissions$ = combineLatest([all$, this.view$, topFinishers$]).pipe(
      map(([submissions, view, top]) => {
        if (view === 'needs-a-look') {
          return submissions.filter((s) => s.validationStatus === COMPETITION_VALIDATION_STATUS.unverified);
        }

        if (view === 'top-finishers') {
          return submissions.filter(
            (s) => top.has(s.userGuid) && s.validationStatus !== COMPETITION_VALIDATION_STATUS.discarded
          );
        }

        return submissions;
      })
    );
  }

  public show(view: AdminSubmissionsView): void {
    this.view$.next(view);
  }
}
