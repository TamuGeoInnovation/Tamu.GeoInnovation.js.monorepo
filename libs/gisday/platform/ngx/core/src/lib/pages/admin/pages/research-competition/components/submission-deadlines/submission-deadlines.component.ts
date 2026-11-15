import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  DEADLINE_COMPETITION_TABLE,
  DeadlineKind,
  SUBMISSION_DEADLINE_FIELDS,
  SubmissionDeadlineField,
  asDate,
  deadlineField,
  deadlinesProblem,
  inCentralTime,
  runsCompetition
} from '@tamu-gisc/gisday/common';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';
import { AccordionContentDirective, AccordionDirective, AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';

type DeadlinesForm = FormGroup<Record<SubmissionDeadlineField, FormControl<Date | string | null>>>;

/**
 * When a season's competitions close, poster and presentation (#2934), paper and cartography (#2962), set by the admins
 * on the competitions' page: for each, when new submissions and edits close, and when, later, the files attached to them do. Empty leaves it open. The
 * API enforces them; the student's submission page shows them. Entered and shown as the scoring window is (#2474): the
 * picker, and beside it the moment in Central time whatever the admin's computer is set to.
 *
 * A panel (#2969), on the shared accordion: collapsed to a one-line summary once the season has deadlines, so the
 * submissions below it are what the page opens on, and open to edit when it has none. Open, it is a table of one row
 * per competition, however many the competitions table lists.
 */
@Component({
  selector: 'tamu-gisc-submission-deadlines',
  templateUrl: './submission-deadlines.component.html',
  styleUrls: ['./submission-deadlines.component.scss'],
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    DateTimePickerComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective
  ]
})
export class SubmissionDeadlinesComponent {
  private readonly seasons = inject(SeasonService);

  /** The season whose deadlines are shown: the one the page's season picker has chosen. */
  public readonly season = input<Partial<Season> | null>(null);

  /** One block per competition, from the shared table (#2962). */
  /**
   * One row per competition the season runs (#2948), from the shared table (#2962). A competition turned off keeps
   * whatever deadlines it had, so turning it on again brings them back.
   */
  public readonly competitions = computed(() =>
    DEADLINE_COMPETITION_TABLE.filter(({ competition }) => runsCompetition(this.season(), competition)).map(
      ({ competition, label }) => ({ key: competition, label })
    )
  );

  public readonly kinds: ReadonlyArray<{ kind: DeadlineKind; label: string }> = [
    { kind: 'submissions', label: 'Submissions and edits close' },
    { kind: 'files', label: 'File uploads close' }
  ];

  public readonly form: DeadlinesForm = new FormGroup(
    Object.fromEntries(
      SUBMISSION_DEADLINE_FIELDS.map((field) => [field, new FormControl<Date | string | null>(null)])
    ) as Record<SubmissionDeadlineField, FormControl<Date | string | null>>
  );

  /** Whether the panel is open to edit. Set from the season each time one is chosen; the header toggles it. */
  public readonly expanded = signal(true);

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /**
   * The panel's line while collapsed (#2969): each competition's deadlines as the form holds them, in brief, with the
   * zone named once. "Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov 16, 12:00 PM · Presentation open (Central time)"
   */
  public readonly summary = computed(() => {
    const values = this.values();

    if (SUBMISSION_DEADLINE_FIELDS.every((field) => !asDate(values[field]))) {
      return 'No deadlines set: every competition is open.';
    }

    const brief = (field: SubmissionDeadlineField) => inCentralTime(values[field], '', { brief: true });
    const lines = this.competitions().map(({ key }) => {
      const name = `${key[0].toUpperCase()}${key.slice(1)}`;
      const submissions = brief(deadlineField(key, 'submissions'));
      const files = brief(deadlineField(key, 'files'));

      return `${name} ${submissions ? `closes ${submissions}` : 'open'}${files ? `; files ${files}` : ''}`;
    });

    return `${lines.join(' · ')} (Central time)`;
  });

  public readonly saving = signal(false);

  /** What became of the last save: saved, or why not. */
  public readonly result = signal<{ saved: boolean; text: string } | null>(null);

  public readonly deadlineField = deadlineField;
  public readonly inCentralTime = inCentralTime;

  constructor() {
    // Another season chosen, or this one saved and read again: the form shows what the season holds, collapsed to its
    // summary if it holds any deadline and open to set them if it holds none.
    effect(() => {
      const season = this.season();
      const deadlines = Object.fromEntries(
        SUBMISSION_DEADLINE_FIELDS.map((field) => [field, asDate(season?.[field])])
      ) as Record<SubmissionDeadlineField, Date | null>;

      this.form.reset(deadlines);
      this.expanded.set(Object.values(deadlines).every((deadline) => deadline === null));
    });
  }

  /** Empties one deadline: that side stays open. */
  public clear(field: SubmissionDeadlineField): void {
    this.form.controls[field].setValue(null);
  }

  public save(): void {
    const season = this.season();

    if (!season?.guid) {
      return;
    }

    const deadlines = Object.fromEntries(
      SUBMISSION_DEADLINE_FIELDS.map((field) => [field, asDate(this.form.controls[field].value)?.toISOString() ?? null])
    );
    const problem = deadlinesProblem(deadlines);

    if (problem) {
      this.result.set({ saved: false, text: problem });

      return;
    }

    this.saving.set(true);
    this.result.set(null);

    this.seasons.setSubmissionDeadlines(season.guid, deadlines).subscribe({
      next: () => {
        this.saving.set(false);
        this.result.set({ saved: true, text: 'Deadlines saved.' });
      },
      error: (err) => {
        this.saving.set(false);
        this.result.set({
          saved: false,
          text: typeof err?.error?.message === 'string' ? err.error.message : 'The deadlines could not be saved.'
        });
      }
    });
  }
}
