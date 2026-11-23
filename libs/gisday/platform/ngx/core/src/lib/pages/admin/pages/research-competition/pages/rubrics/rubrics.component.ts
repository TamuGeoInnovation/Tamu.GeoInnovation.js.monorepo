import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  DEFAULT_RUBRICS,
  RUBRIC_COMPETITION_TYPES,
  RUBRIC_LEVEL_LABELS,
  RubricCompetitionType,
  RubricDto,
  RubricValue,
  rubricProblem,
  rubricTotal
} from '@tamu-gisc/gisday/common';

import { seasonChoice } from '../../components/season-choice';

type LevelForm = FormGroup<{ label: FormControl<string>; description: FormControl<string> }>;
type CriterionForm = FormGroup<{
  guid: FormControl<string | null>;
  name: FormControl<string>;
  maxPoints: FormControl<string>;
  levels: FormArray<LevelForm>;
}>;
export type RubricForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  criteria: FormArray<CriterionForm>;
}>;

/** One competition type's place on the page: its saved rubric and the form editing it, or none yet. */
export interface RubricPanel {
  type: RubricCompetitionType;
  label: string;
  rubric: RubricDto | null;
  form: RubricForm | null;
}

const LABELS: Record<RubricCompetitionType, string> = {
  poster: 'Poster rubric',
  presentation: 'Research presentation rubric'
};

function levelForm(label = '', description = ''): LevelForm {
  return new FormGroup({
    label: new FormControl(label, { nonNullable: true }),
    description: new FormControl(description, { nonNullable: true })
  });
}

function criterionForm(c?: Partial<RubricDto['criteria'][number]>): CriterionForm {
  return new FormGroup({
    guid: new FormControl<string | null>(c?.guid ?? null),
    name: new FormControl(c?.name ?? '', { nonNullable: true }),
    maxPoints: new FormControl(c?.maxPoints === undefined ? '' : String(c.maxPoints), { nonNullable: true }),
    // A new criterion starts with the standard levels, to describe.
    levels: new FormArray(
      (c?.levels ?? RUBRIC_LEVEL_LABELS.map((label) => ({ label, description: '' }))).map((l) =>
        levelForm(l.label, l.description)
      )
    )
  });
}

/** A saved rubric as a form to edit. */
export function rubricForm(rubric: RubricDto): RubricForm {
  return new FormGroup({
    name: new FormControl(rubric.name, { nonNullable: true }),
    description: new FormControl(rubric.description ?? '', { nonNullable: true }),
    criteria: new FormArray(rubric.criteria.map((c) => criterionForm(c)))
  });
}

/** A rubric form as the API takes it: points as numbers, and each criterion's id kept, so its scores stay with it. */
export function rubricValue(form: RubricForm): Omit<RubricValue, 'competitionType'> {
  const value = form.getRawValue();

  return {
    name: value.name,
    description: value.description.trim() ? value.description : null,
    criteria: value.criteria.map((c) => ({
      ...(c.guid ? { guid: c.guid } : {}),
      name: c.name,
      maxPoints: c.maxPoints.trim() === '' ? NaN : Number(c.maxPoints),
      levels: c.levels
    }))
  };
}

/**
 * The rubrics judges score against (#3183), per season, on the research competitions' admin pages: one for posters and
 * one for research presentations. A season without one offers **Start from the standard rubric**, the organizer's. Each
 * criterion has a name, its points and the levels of work it describes; a criterion kept keeps its id when saved, so the
 * scores judges gave it stay with it.
 */
@Component({
  selector: 'tamu-gisc-rubrics',
  templateUrl: './rubrics.component.html',
  styleUrls: ['./rubrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, SelectComponent, TextboxComponent]
})
export class RubricsComponent {
  private readonly judging = inject(JudgingService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly choice = seasonChoice();
  public readonly panels = signal<Array<RubricPanel> | null>(null);
  /** What happened to the last save or start, by competition type. */
  public readonly status = signal<Record<string, { problem?: string; saved?: boolean }>>({});
  public readonly rubricTotal = rubricTotal;

  constructor() {
    effect(() => {
      const season = this.choice.season();

      if (season) {
        this.load(season.guid);
      }
    });
  }

  /** The points a rubric form's criteria add up to, as typed. */
  public total(form: RubricForm): number {
    return rubricTotal({ criteria: form.getRawValue().criteria.map((c) => ({ maxPoints: Number(c.maxPoints) || 0 })) });
  }

  /** Starts the season's rubric for a type from the standard one, to edit from there. */
  public startFromStandard(type: RubricCompetitionType): void {
    const season = this.choice.season();

    if (!season) {
      return;
    }

    this.judging
      .createRubric(season.guid, DEFAULT_RUBRICS[type])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(season.guid),
        error: (err) => this.setStatus(type, { problem: serverMessage(err, 'The rubric could not be started.') })
      });
  }

  public addCriterion(form: RubricForm): void {
    form.controls.criteria.push(criterionForm());
  }

  public removeCriterion(form: RubricForm, index: number): void {
    form.controls.criteria.removeAt(index);
  }

  public save(panel: RubricPanel): void {
    if (!panel.rubric || !panel.form) {
      return;
    }

    const value = rubricValue(panel.form);
    const problem = rubricProblem({ ...value, competitionType: panel.type });

    if (problem) {
      this.setStatus(panel.type, { problem });
      return;
    }

    this.judging
      .updateRubric(panel.rubric.guid, value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.panels.update((panels) =>
            (panels ?? []).map((p) => (p.type === panel.type ? { ...p, rubric: saved, form: rubricForm(saved) } : p))
          );
          this.setStatus(panel.type, { saved: true });
        },
        error: (err) => this.setStatus(panel.type, { problem: serverMessage(err, 'The rubric was not saved.') })
      });
  }

  private setStatus(type: string, state: { problem?: string; saved?: boolean }): void {
    this.status.update((status) => ({ ...status, [type]: state }));
  }

  private load(seasonGuid: string): void {
    this.panels.set(null);
    this.status.set({});
    this.judging
      .rubrics(seasonGuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rubrics) =>
          this.panels.set(
            RUBRIC_COMPETITION_TYPES.map((type) => {
              const rubric = rubrics.find((r) => r.competitionType === type) ?? null;

              return { type, label: LABELS[type], rubric, form: rubric ? rubricForm(rubric) : null };
            })
          ),
        error: () => this.panels.set([])
      });
  }
}
