import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DetailsPanelComponent, TabComponent, TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { matchesText, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  ASSESSMENT_COMMENT_LIMIT,
  JudgeCompetitionDto,
  JudgePageDto,
  JudgeSubmissionDto,
  assessmentProblem,
  byFirstAuthor,
  rubricTotal,
  scoredLine
} from '@tamu-gisc/gisday/common';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

/** How a submission's save stands: being sent, sent (when), or refused (why). */
interface SaveState {
  saving?: boolean;
  saved?: string;
  problem?: string;
}

/** An entry with the competition it is in, its tab, and where it is in that competition's list. */
export interface JudgeEntry {
  competition: JudgeCompetitionDto;
  submission: JudgeSubmissionDto;
  tab: number;
  position: number;
  of: number;
}

/** How many matches the search box lists under itself (#3230). */
export const JUDGE_MATCHES_SHOWN = 8;

/**
 * The entries a judge's search finds, by title or by author (#3230, decided 2A), in every competition they judge (3A), in
 * the order of the page's tabs and lists. Nothing for an empty search.
 */
export function judgeMatches(entries: Array<JudgeEntry>, search: string): Array<JudgeEntry> {
  if (!search.trim()) {
    return [];
  }

  return entries.filter((e) => matchesText([e.submission.title, ...(e.submission.presenters ?? [])], search));
}

/**
 * A judge's page (#3183), reached from the judging link emailed to them, with no account. A tab per competition they
 * judge, each listing its accepted entries (#3200). An entry opens in a details panel over the list (#3230): its title,
 * presenters and abstract, a score per criterion of the rubric with the levels it describes, a comment, and Save, with
 * Previous and Next to the entries beside it. A search box above the list, and on the panel, finds an entry by its title or
 * an author. Escape closes the panel, asking first when its scores have changed and are not saved. Judges can change
 * their scores until the admins close judging; then the page shows them, read-only. Judges use it on their phones in the
 * room, so it is one column, and the panel is the whole screen.
 */
@Component({
  selector: 'tamu-gisc-judging',
  templateUrl: './judging.component.html',
  styleUrls: ['./judging.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CentralDatePipe,
    NgTemplateOutlet,
    ButtonComponent,
    TextboxComponent,
    TabsComponent,
    TabComponent,
    DetailsPanelComponent
  ]
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

  /** Every entry on the page, competition by competition, as the tabs list them. */
  public readonly entries = computed<Array<JudgeEntry>>(() =>
    (this.judge()?.competitions ?? []).flatMap((competition, tab) =>
      competition.submissions.map((submission, position) => ({
        competition,
        submission,
        tab,
        position,
        of: competition.submissions.length
      }))
    )
  );

  /** The open tab. */
  public readonly tab = signal(0);

  /** The entry open in the details panel, by its id, or null with the panel closed. */
  public readonly openGuid = signal<string | null>(null);
  public readonly opened = computed(() => this.entries().find((e) => e.submission.guid === this.openGuid()) ?? null);

  /** The search box, on the page and on the panel (#3230). */
  public readonly search = new FormControl('', { nonNullable: true });
  private readonly searchText = toSignal(this.search.valueChanges, { initialValue: '' });
  public readonly matches = computed(() => judgeMatches(this.entries(), this.searchText()));
  public readonly matchesShown = computed(() => this.matches().slice(0, JUDGE_MATCHES_SHOWN));
  /** Whether the search's matches are listed: while the box has focus, until one is chosen or Escape. */
  public readonly matchesOpen = signal(false);

  /** What the judge asked for while the open entry's scores were changed and not saved, waiting on their answer (5B). */
  public readonly leaving = signal<(() => void) | null>(null);

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

  /** Whether an entry's scores or comment have changed since they were last saved, or loaded. */
  public unsaved(submission: JudgeSubmissionDto): boolean {
    return Boolean(this.formFor(submission)?.dirty);
  }

  /** Opens an entry in the details panel, from its row or from a search match, on its competition's tab. */
  public open(entry: JudgeEntry): void {
    this.leaveOpened(() => {
      this.tab.set(entry.tab);
      this.openGuid.set(entry.submission.guid);
      this.closeMatches();
      this.search.setValue('');
    });
  }

  /** Opens an entry from its row in a tab's list. */
  public openRow(submission: JudgeSubmissionDto): void {
    const entry = this.entries().find((e) => e.submission.guid === submission.guid);

    if (entry) {
      this.open(entry);
    }
  }

  /** The entry before or after the open one in its competition's list (6B). */
  public neighbour(step: -1 | 1): JudgeEntry | null {
    const opened = this.opened();

    return opened ? (this.entries().find((e) => e.tab === opened.tab && e.position === opened.position + step) ?? null) : null;
  }

  public step(step: -1 | 1): void {
    const next = this.neighbour(step);

    if (next) {
      this.open(next);
    }
  }

  /** Closes the details panel, asking first if its scores are not saved. */
  public close(): void {
    this.leaveOpened(() => this.openGuid.set(null));
  }

  /** Escape, or a click on the page behind the panel: answers Stay to the question if it is asked, or closes the panel. */
  public closeRequested(): void {
    if (this.leaving()) {
      this.leaving.set(null);
    } else {
      this.close();
    }
  }

  /** Leave without saving: the entry's scores go back to what was saved, and the judge goes where they asked. */
  public discard(): void {
    const opened = this.opened();
    const then = this.leaving();

    if (opened) {
      this.forms.set(opened.submission.guid, formOf(opened.competition, opened.submission));
      this.setSave(opened.submission.guid, undefined);
    }

    this.leaving.set(null);
    then?.();
  }

  public stay(): void {
    this.leaving.set(null);
  }

  /** Escape in the search box closes its matches, and only that, while they are listed. */
  public searchEscape(event: Event): void {
    if (this.matchesOpen()) {
      this.closeMatches();
      event.preventDefault();
    }
  }

  public closeMatches(): void {
    this.matchesOpen.set(false);
  }

  /** Closes the matches when focus leaves the box and its matches, as a click elsewhere does. */
  public searchBlur(event: FocusEvent): void {
    const box = event.currentTarget as HTMLElement;

    if (!box.contains(event.relatedTarget as Node)) {
      this.closeMatches();
    }
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
          // What was sent is what is saved now: nothing to ask about on leaving it (#3230).
          form.markAsPristine();
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

  /** Does `then` at once, or, if the open entry's scores are changed and not saved, asks first (#3230, decided 5B). */
  private leaveOpened(then: () => void): void {
    const opened = this.opened();

    if (opened && !opened.competition.closed && this.unsaved(opened.submission)) {
      this.leaving.set(then);
      return;
    }

    then();
  }

  private setSave(guid: string, state: SaveState | undefined): void {
    this.saves.update((saves) => {
      const next = { ...saves };

      if (state) {
        next[guid] = state;
      } else {
        delete next[guid];
      }

      return next;
    });
  }

  private load(token: string): void {
    this.page.set(null);

    this.judging
      .forLink(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (loaded) => {
          // Each competition's entries by their first author's last name (#3200).
          const page: JudgePageDto = {
            ...loaded,
            competitions: loaded.competitions.map((c) => ({ ...c, submissions: byFirstAuthor(c.submissions) }))
          };

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
