import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  DEADLINE_COMPETITION_TABLE,
  DeadlineCompetition,
  SEASON_COMPETITIONS,
  competitionTypesProblem,
  runsCompetition
} from '@tamu-gisc/gisday/common';
import { ButtonComponent, CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

type CompetitionsForm = FormGroup<Record<DeadlineCompetition, FormControl<boolean>>>;

/**
 * Which research competitions a season runs (#2948), set by the admins on the competitions' page above their deadlines.
 * The submission form offers only those, the deadlines below follow, and the API refuses a new submission to any other.
 * A submission already made to a competition turned off stays as it is, and is still listed here.
 */
@Component({
  selector: 'tamu-gisc-season-competitions',
  templateUrl: './season-competitions.component.html',
  imports: [ReactiveFormsModule, ButtonComponent, CheckboxComponent]
})
export class SeasonCompetitionsComponent {
  private readonly seasons = inject(SeasonService);

  /** The season shown: the one the page's season picker has chosen. */
  public readonly season = input<Partial<Season> | null>(null);

  public readonly competitions = DEADLINE_COMPETITION_TABLE.map(({ competition, label }) => ({ key: competition, label }));

  public readonly form: CompetitionsForm = new FormGroup(
    Object.fromEntries(
      SEASON_COMPETITIONS.map((competition) => [competition, new FormControl(true, { nonNullable: true })])
    ) as Record<DeadlineCompetition, FormControl<boolean>>
  );

  public readonly saving = signal(false);

  /** What became of the last save: saved, or why not. */
  public readonly result = signal<{ saved: boolean; text: string } | null>(null);

  constructor() {
    // Another season chosen, or this one saved and read again: the boxes show what the season runs.
    effect(() => {
      const season = this.season();

      this.form.reset(
        Object.fromEntries(
          SEASON_COMPETITIONS.map((competition) => [competition, runsCompetition(season, competition)])
        ) as Record<DeadlineCompetition, boolean>
      );
    });
  }

  public save(): void {
    const season = this.season();

    if (!season?.guid) {
      return;
    }

    const chosen = SEASON_COMPETITIONS.filter((competition) => this.form.controls[competition].value);
    const problem = competitionTypesProblem(chosen);

    if (problem) {
      this.result.set({ saved: false, text: problem });

      return;
    }

    this.saving.set(true);
    this.result.set(null);

    this.seasons.setCompetitionTypes(season.guid, chosen).subscribe({
      next: () => {
        this.saving.set(false);
        this.result.set({ saved: true, text: 'Competitions saved.' });
      },
      error: (err) => {
        this.saving.set(false);
        this.result.set({
          saved: false,
          text: typeof err?.error?.message === 'string' ? err.error.message : 'The competitions could not be saved.'
        });
      }
    });
  }
}
