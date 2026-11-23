import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

/**
 * The season a judging admin page shows (#3183), the Rubrics and the Judging results pages alike: the active season to
 * start, and any other chosen from the seasons' list, as the submissions list's Season box offers them. Called in a
 * component's field initializer.
 */
export function seasonChoice() {
  const seasons = inject(SeasonService);
  const season = signal<{ guid: string; year?: number } | null>(null);

  seasons.activeSeason$.pipe(take(1), takeUntilDestroyed(inject(DestroyRef))).subscribe((active) => {
    if (active && !season()) {
      season.set({ guid: active.guid, year: active.year });
    }
  });

  const list = toSignal(seasons.seasons$, { initialValue: [] });

  return {
    seasons: list,
    season,
    /** Shows the season with this id, from the seasons' list. */
    choose(guid: string) {
      const chosen = (list() ?? []).find((s) => s.guid === guid);

      season.set(chosen ? { guid: chosen.guid, year: chosen.year } : guid ? { guid } : null);
    }
  };
}
