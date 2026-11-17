import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  ASSESSMENT_COMMENT_LIMIT,
  JudgeCompetitionDto,
  JudgePageDto,
  JudgeSubmissionDto,
  assessmentProblem,
  rubricTotal,
  scoredLine
} from '@tamu-gisc/gisday/common';

/** How a submission's save stands: being sent, sent (when), or refused (why). */
interface SaveState {
  saving?: boolean;
  saved?: string;
  problem?: string;
}

/**
 * A judge's page (#3183), reached from the judging link emailed to them, with no account. Each competition they judge, a
 * card per accepted submission (its title, presenters and abstract), a score per criterion of the rubric with the levels
 * it describes, a comment, and Save. They can change their scores until the admins close judging; then the page shows
 * them, read-only. Judges use it on their phones in the room, so it is one column.
 */
@Component({
  selector: 'tamu-gisc-judging',
  templateUrl: './judging.component.html',
  styleUrls: ['./judging.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, ButtonComponent, TextboxComponent]
})
export class JudgingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly judging = inject(JudgingService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly token = signal<string | null>(null);
  /** What the link opens, or 'invalid' when it does not work. Null while it loads. */
  public readonly page = signal<JudgePageDto | 'invalid' | null>(null);
  public readonly judge = computed(() => {
    const page = this.page();

    return page && page !== 'invalid' ? page : null;
  });
  public readonly invalid = computed(() => this.page() === 'invalid');
  /** Each submission's save, by its id. */
  public readonly saves = signal<Record<string, SaveState>>({});

  public readonly commentLimit = ASSESSMENT_COMMENT_LIMIT;
  public readonly scoredLine = scoredLine;
  public readonly rubricTotal = rubricTotal;

  /** Each submission's scores and comment, by its id. */
  private forms = new Map<string, FormGroup>();

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const token = params.get('token');

      this.token.set(token);

      if (token) {
        this.load(token);
      }
    });
  }

  /** The scores and comment of one submission, for its card. */
  public formFor(submission: JudgeSubmissionDto): FormGroup {
    return this.forms.get(submission.guid);
  }

  /** Saves a judge's scores for one submission, checked first as the API checks them. */
  public save(competition: JudgeCompetitionDto, submission: JudgeSubmissionDto): void {
    const token = this.token();
    const form = this.formFor(submission);

    if (!token || !form || competition.closed || !competition.rubric || this.saves()[submission.guid]?.saving) {
      return;
    }

    const value = form.getRawValue() as Record<string, string | number | null>;
    const comment = typeof value['comment'] === 'string' ? (value['comment'] as string) : '';
    const scores = Object.fromEntries(competition.rubric.criteria.map((c) => [c.guid, asScore(value[c.guid])]));
    const problem = assessmentProblem(competition.rubric.criteria, scores, comment);

    if (problem) {
      this.setSave(submission.guid, { problem });
      return;
    }

    this.setSave(submission.guid, { saving: true });
    this.judging
      .assess(token, submission.guid, { scores: scores as Record<string, number>, comment })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (assessment) => {
          this.setSave(submission.guid, { saved: assessment.updated });
          // The page's own copy, so the progress line counts it.
          this.page.update((page) =>
            page && page !== 'invalid'
              ? {
                  ...page,
                  competitions: page.competitions.map((c) => ({
                    ...c,
                    submissions: c.submissions.map((s) => (s.guid === submission.guid ? { ...s, assessment } : s))
                  }))
                }
              : page
          );
        },
        error: (err) =>
          this.setSave(submission.guid, { problem: serverMessage(err, 'Your scores were not saved. Please try again.') })
      });
  }

  private setSave(guid: string, state: SaveState): void {
    this.saves.update((saves) => ({ ...saves, [guid]: state }));
  }

  private load(token: string): void {
    this.page.set(null);

    this.judging
      .forLink(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.forms = new Map(
            page.competitions.flatMap((competition) =>
              competition.submissions.map((submission) => [submission.guid, formOf(competition, submission)] as const)
            )
          );
          this.page.set(page);
        },
        error: () => this.page.set('invalid')
      });
  }
}

/** A submission's scores and comment as a form: what the judge saved, if anything, and read-only once judging closes. */
function formOf(competition: JudgeCompetitionDto, submission: JudgeSubmissionDto): FormGroup {
  const saved = submission.assessment;
  const form = new FormGroup({
    ...Object.fromEntries(
      (competition.rubric?.criteria ?? []).map((c) => [c.guid, new FormControl<string>(scoreText(saved?.scores?.[c.guid]))])
    ),
    comment: new FormControl<string>(saved?.comment ?? '')
  });

  if (competition.closed) {
    form.disable();
  }

  return form;
}

/** A saved score as its box shows it. */
function scoreText(score: number | undefined): string {
  return score === undefined || score === null ? '' : String(score);
}

/** A score as typed, as a number when it is one, so the check names what is wrong with it. */
function asScore(value: unknown): number | string | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const n = Number(String(value).trim());

  return Number.isFinite(n) ? n : String(value);
}
