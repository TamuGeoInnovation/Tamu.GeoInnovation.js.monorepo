import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  DEADLINE_COMPETITIONS,
  DeadlineKind,
  SUBMISSION_DEADLINE_FIELDS,
  SubmissionDeadlineField,
  asDate,
  deadlineField,
  deadlinesProblem,
  inCentralTime
} from '@tamu-gisc/gisday/common';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';

type DeadlinesForm = FormGroup<Record<SubmissionDeadlineField, FormControl<Date | string | null>>>;

/**
 * When a season's poster and presentation competitions close (#2934), set by the admins on the competitions' page: for
 * each, when new submissions and edits close, and when, later, the files attached to them do. Empty leaves it open. The
 * API enforces them; the student's submission page shows them. Entered and shown as the scoring window is (#2474): the
 * picker, and beneath it the moment in Central time whatever the admin's computer is set to.
 */
@Component({
  selector: 'tamu-gisc-submission-deadlines',
  templateUrl: './submission-deadlines.component.html',
  imports: [ReactiveFormsModule, ButtonComponent, DateTimePickerComponent]
})
export class SubmissionDeadlinesComponent {
  private readonly seasons = inject(SeasonService);

  /** The season whose deadlines are shown: the one the page's season picker has chosen. */
  public readonly season = input<Partial<Season> | null>(null);

  public readonly competitions = DEADLINE_COMPETITIONS.map((key) => ({
    key,
    label: key === 'poster' ? 'Poster competition' : 'Presentation competition'
  }));

  public readonly kinds: ReadonlyArray<{ kind: DeadlineKind; label: string }> = [
    { kind: 'submissions', label: 'Submissions and edits close' },
    { kind: 'files', label: 'File uploads close' }
  ];

  public readonly form: DeadlinesForm = new FormGroup(
    Object.fromEntries(
      SUBMISSION_DEADLINE_FIELDS.map((field) => [field, new FormControl<Date | string | null>(null)])
    ) as Record<SubmissionDeadlineField, FormControl<Date | string | null>>
  );

  public readonly saving = signal(false);

  /** What became of the last save: saved, or why not. */
  public readonly result = signal<{ saved: boolean; text: string } | null>(null);

  public readonly deadlineField = deadlineField;
  public readonly inCentralTime = inCentralTime;

  constructor() {
    // Another season chosen, or this one saved and read again: the form shows what the season holds.
    effect(() => {
      const season = this.season();

      this.form.reset(
        Object.fromEntries(SUBMISSION_DEADLINE_FIELDS.map((field) => [field, asDate(season?.[field])])) as Record<
          SubmissionDeadlineField,
          Date | null
        >
      );
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
