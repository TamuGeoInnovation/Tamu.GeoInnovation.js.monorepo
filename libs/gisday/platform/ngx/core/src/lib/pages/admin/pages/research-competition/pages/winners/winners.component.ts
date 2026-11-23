import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SeasonWinnersService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  SeasonWinnersAdminDto,
  WINNER_PLACES,
  WinnerChoice,
  WinnerEntryDto,
  placeLabel,
  winnerChoicesProblem
} from '@tamu-gisc/gisday/common';

import { seasonChoice } from '../../components/season-choice';

/** How an entry is offered: its title, then its people. */
export function entryLabel(entry: WinnerEntryDto): string {
  const names = entry.names.join(', ');

  return [entry.title || 'Untitled', names && `(${names})`].filter(Boolean).join(' ');
}

const keyOf = (competition: string, place: number) => `${competition}:${place}`;

/**
 * A season's winners (#3239, decided 1A): 1st, 2nd and 3rd of each research competition, picked from the season's
 * accepted entries, for gisday.tamu.edu's homepage. Nothing is typed, so no name is written anywhere but in the
 * submission. The trail challenge's winners are people, not entries, and are not picked here yet.
 */
@Component({
  selector: 'tamu-gisc-winners',
  templateUrl: './winners.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, ButtonComponent]
})
export class WinnersComponent {
  private readonly winners = inject(SeasonWinnersService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly choice = seasonChoice();
  public readonly places = WINNER_PLACES;
  public readonly placeLabel = placeLabel;
  public readonly page = signal<SeasonWinnersAdminDto | null>(null);
  /** The entry picked for each place, by `competition:place`. */
  public readonly picks = signal<Record<string, string | null>>({});
  public readonly status = signal<{ problem?: string; saved?: boolean } | null>(null);
  /** Each competition's entries as its boxes offer them, one list each, so a box keeps its options as it redraws. */
  public readonly options = computed(
    () =>
      new Map(
        (this.page()?.competitions ?? []).map((c) => [
          c.competition,
          c.entries.map((e) => ({ name: entryLabel(e), value: e.guid }))
        ])
      )
  );

  constructor() {
    effect(() => {
      const season = this.choice.season();

      if (season) {
        this.load(season.guid);
      }
    });
  }

  public picked(competition: string, place: number): string | undefined {
    return this.picks()[keyOf(competition, place)] ?? undefined;
  }

  public pick(competition: string, place: number, value: unknown): void {
    this.picks.update((picks) => ({
      ...picks,
      [keyOf(competition, place)]: typeof value === 'string' && value ? value : null
    }));
    this.status.set(null);
  }

  /** Every place of every competition, as the API replaces them: those not picked are sent empty. */
  public choices(): Array<WinnerChoice> {
    return (this.page()?.competitions ?? []).flatMap(({ competition }) =>
      this.places.map((place) => ({ competition, place, submission: this.picked(competition, place) ?? null }))
    );
  }

  public save(): void {
    const season = this.choice.season();
    const winners = this.choices();
    const problem = winnerChoicesProblem(winners);

    if (!season) {
      return;
    }

    if (problem) {
      this.status.set({ problem });
      return;
    }

    this.winners
      .save(season.guid, winners)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.show(page);
          this.status.set({ saved: true });
        },
        error: (err) => this.status.set({ problem: serverMessage(err, 'The winners were not saved.') })
      });
  }

  private load(season: string): void {
    this.page.set(null);
    this.status.set(null);
    this.winners
      .forSeason(season)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this.show(page),
        error: (err) => this.status.set({ problem: serverMessage(err, 'The winners could not be loaded.') })
      });
  }

  private show(page: SeasonWinnersAdminDto): void {
    this.picks.set(Object.fromEntries(page.winners.map((w) => [keyOf(w.competition, w.place), w.submission])));
    this.page.set(page);
  }
}
