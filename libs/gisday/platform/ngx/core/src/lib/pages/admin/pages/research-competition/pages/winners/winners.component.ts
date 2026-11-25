import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { SeasonWinnersService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { seasonPicker, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  SeasonWinnersAdminDto,
  TRAIL_COMPETITION,
  TrailChoice,
  TrailEntryDto,
  TrailWinnersAdminDto,
  WINNER_PLACES,
  WinnerChoice,
  WinnerEntryDto,
  placeLabel,
  trailChoicesProblem,
  winnerChoicesProblem
} from '@tamu-gisc/gisday/common';

/**
 * How an entry is offered: its main author, then its title, then anyone else on it (#3292). The title came first, and a
 * long one cut the names off, so who was who could not be seen. The main author is the first of the submission's
 * people, in the order the API gives them (`presentersOf`).
 */
export function entryLabel(entry: WinnerEntryDto): string {
  const [author, ...others] = entry.names;
  const label = `${author || 'No name given'} - ${entry.title || 'Untitled'}`;

  return others.length ? `${label} (with ${others.join(', ')})` : label;
}

/** How a trail challenge submitter is offered (#3243): their name, then their points, as the leaderboard gives them. */
export function trailEntryLabel(entry: TrailEntryDto): string {
  return `${entry.name || 'No name given'} (${entry.points} ${entry.points === 1 ? 'point' : 'points'})`;
}

const keyOf = (competition: string, place: number) => `${competition}:${place}`;

/**
 * A season's winners (#3239, decided 1A): 1st, 2nd and 3rd of each research competition, picked from the season's
 * accepted entries, for gisday.tamu.edu's homepage. Nothing is typed, so no name is written anywhere but in the
 * submission. The trail challenge's are people, picked from the season's submitters in the leaderboard's order, each
 * with their name and points (#3243).
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

  public readonly choice = seasonPicker();
  public readonly places = WINNER_PLACES;
  public readonly placeLabel = placeLabel;
  public readonly page = signal<SeasonWinnersAdminDto | null>(null);
  /** The trail challenge's submitters and places (#3243). */
  public readonly trail = signal<TrailWinnersAdminDto | null>(null);
  public readonly trailKey = TRAIL_COMPETITION;
  /** The entry picked for each place, by `competition:place`. */
  public readonly picks = signal<Record<string, string | null>>({});
  public readonly status = signal<{ problem?: string; saved?: boolean } | null>(null);
  /** Each competition's entries as its boxes offer them, one list each, so a box keeps its options as it redraws. */
  public readonly options = computed(
    () =>
      new Map([
        ...(this.page()?.competitions ?? []).map(
          (c) => [c.competition, c.entries.map((e) => ({ name: entryLabel(e), value: e.guid }))] as const
        ),
        [TRAIL_COMPETITION, (this.trail()?.entries ?? []).map((e) => ({ name: trailEntryLabel(e), value: e.account }))]
      ])
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

  /** The trail challenge's three places, those not picked sent empty (#3243). */
  public trailChoices(): Array<TrailChoice> {
    return this.places.map((place) => ({ place, account: this.picked(TRAIL_COMPETITION, place) ?? null }));
  }

  /** Saves the research competitions' places, then the trail challenge's, each replacing what it had. */
  public save(): void {
    const season = this.choice.season();
    const winners = this.choices();
    const trail = this.trailChoices();
    const problem = winnerChoicesProblem(winners) ?? trailChoicesProblem(trail);

    if (!season) {
      return;
    }

    if (problem) {
      this.status.set({ problem });
      return;
    }

    forkJoin([this.winners.save(season.guid, winners), this.winners.saveTrail(season.guid, trail)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([page, saved]) => {
          this.show(page, saved);
          this.status.set({ saved: true });
        },
        error: (err) => this.status.set({ problem: serverMessage(err, 'The winners were not saved.') })
      });
  }

  private load(season: string): void {
    this.page.set(null);
    this.trail.set(null);
    this.status.set(null);
    forkJoin([this.winners.forSeason(season), this.winners.trail(season)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([page, trail]) => this.show(page, trail),
        error: (err) => this.status.set({ problem: serverMessage(err, 'The winners could not be loaded.') })
      });
  }

  private show(page: SeasonWinnersAdminDto, trail: TrailWinnersAdminDto): void {
    this.picks.set(
      Object.fromEntries([
        ...page.winners.map((w) => [keyOf(w.competition, w.place), w.submission]),
        ...trail.winners.map((w) => [keyOf(TRAIL_COMPETITION, w.place), w.account])
      ])
    );
    this.trail.set(trail);
    this.page.set(page);
  }
}
