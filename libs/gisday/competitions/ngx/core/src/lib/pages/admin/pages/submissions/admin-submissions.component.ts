import { Component, OnInit, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, shareReplay } from 'rxjs';

import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';
import { LeaderboardService, SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';
import { downloadFile } from '@tamu-gisc/common/utils/ui';
import { DashboardScrollComponent } from '@tamu-gisc/gisday/platform/ngx/common';
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

/** One row of the counts table (#3244): a category, or the Total, with its submissions by review status. */
export interface SubmissionCountRow {
  category: string;
  submissions: number;
  verified: number;
  unverified: number;
  discarded: number;
}

/** What a submission with no answer to the form's category question is counted under. */
export const NO_CATEGORY = 'No category';

/**
 * How many submissions each category has, by review status, and in all (#3244): a row per category by name, the
 * uncategorized last, and the Total. A category is the form's category question as the list shows it (`questionValue`).
 */
export function submissionCounts(submissions: Array<SubmissionReviewDto>): {
  rows: Array<SubmissionCountRow>;
  total: SubmissionCountRow;
} {
  const empty = (category: string): SubmissionCountRow => ({
    category,
    submissions: 0,
    verified: 0,
    unverified: 0,
    discarded: 0
  });
  const byCategory = new Map<string, SubmissionCountRow>();
  const total = empty('Total');

  for (const submission of submissions) {
    const category = submission.questionValue?.trim() || NO_CATEGORY;
    const row = byCategory.get(category) ?? empty(category);

    for (const counted of [row, total]) {
      counted.submissions++;

      if (submission.validationStatus === COMPETITION_VALIDATION_STATUS.verified) {
        counted.verified++;
      } else if (submission.validationStatus === COMPETITION_VALIDATION_STATUS.discarded) {
        counted.discarded++;
      } else {
        counted.unverified++;
      }
    }

    byCategory.set(category, row);
  }

  const rows = [...byCategory.values()].sort(
    (a, b) =>
      Number(a.category === NO_CATEGORY) - Number(b.category === NO_CATEGORY) ||
      a.category.localeCompare(b.category, 'en', { sensitivity: 'base' })
  );

  return { rows, total };
}

@Component({
  selector: 'tamu-gisc-admin-submissions',
  templateUrl: './admin-submissions.component.html',
  styleUrls: ['./admin-submissions.component.scss'],
  imports: [SubmissionReviewListComponent, DashboardScrollComponent, AsyncPipe]
})
export class AdminSubmissionsComponent implements OnInit {
  private readonly submissionService = inject(SubmissionService);
  private readonly leaderboardService = inject(LeaderboardService);

  public readonly view$ = new BehaviorSubject<AdminSubmissionsView>('all');

  public submissions$: Observable<SubmissionReviewDto[]>;

  /** Every submission this season counted by category (#3244), whichever view is pressed, so the totals stay put. */
  public counts$: Observable<ReturnType<typeof submissionCounts>>;

  public ngOnInit(): void {
    const all$ = this.submissionService.getAdminSubmissions().pipe(shareReplay(1));

    this.counts$ = all$.pipe(map(submissionCounts));
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

  /** Whether the export's zip is being built, and why it could not be, if it could not (#545). */
  public readonly exporting = signal(false);
  public readonly exportProblem = signal<string | null>(null);

  /**
   * Downloads the season's submissions, their answers and their photos, as one zip (#545), for the project's partners.
   * The API builds it while the page waits, as the research competition's files are (#3185).
   */
  public downloadExport(): void {
    this.exporting.set(true);
    this.exportProblem.set(null);

    this.submissionService.getSeasonExportZip().subscribe({
      next: (zip) => {
        this.exporting.set(false);
        downloadFile(zip, 'gisday-vgi-submissions.zip', 'application/zip');
      },
      error: (err) => {
        this.exporting.set(false);
        this.exportProblem.set(
          err?.status === 404
            ? 'This season has no VGI submissions to export.'
            : 'The export could not be downloaded. Try again.'
        );
      }
    });
  }

  /** What the last "Publish to ArcGIS" did, for the page to say (#2433). */
  public readonly arcgisResult = signal<string | undefined>(undefined);
  public readonly publishing = signal(false);

  /**
   * Publishes the season's submissions to its ArcGIS Online layer again, after an outage or once publishing
   * is switched on (#2433). Safe to repeat: points already published are updated.
   */
  public publishToArcgis(): void {
    this.publishing.set(true);
    this.arcgisResult.set('Starting to publish to ArcGIS Online…');

    this.submissionService.publishToArcgis().subscribe({
      next: ({ queued, configured, alreadyRunning }) => {
        this.publishing.set(false);

        if (configured === false) {
          this.arcgisResult.set('Publishing to ArcGIS Online is not set up on this server.');
          return;
        }

        if (alreadyRunning) {
          this.arcgisResult.set('Already publishing to ArcGIS Online. Try again once it has finished.');
          return;
        }

        // It runs on the server, in the background, and takes minutes for a whole season (#2434 review).
        this.arcgisResult.set(
          `Publishing ${queued} submission${queued === 1 ? '' : 's'} to ArcGIS Online in the background. ` +
            'Each failure is in the API log; running it again is safe.'
        );
      },
      error: () => {
        this.publishing.set(false);
        this.arcgisResult.set('Could not publish to ArcGIS Online. Try again, or check the API log.');
      }
    });
  }
}
