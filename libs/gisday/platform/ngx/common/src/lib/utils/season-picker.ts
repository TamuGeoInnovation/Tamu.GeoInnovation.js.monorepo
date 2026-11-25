import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import type { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

/** The season an admin page picked, and the seasons it can pick from. */
export interface SeasonPicker {
  /** Every season, for the page's Season box. */
  readonly seasons$: Observable<Array<Partial<Season>>>;
  /** The season shown: the one the address names, else the active one, else none on a site with no season (#2076). */
  readonly season$: Observable<Partial<Season> | null>;
  /** The same two, as signals, for a page that reads signals. */
  readonly seasons: () => Array<Partial<Season>>;
  readonly season: () => Partial<Season> | null;
  /** Shows the season with this id, by putting it in the address, so a reload or a shared link keeps it. */
  choose(guid: string): void;
}

/**
 * One way for an admin page to pick its season (#3329): admin lists, the judging pages and the dashboards each had their
 * own, and only the lists kept the choice in the address. Called in a component's field initializer, on a page with a
 * route.
 */
export function seasonPicker(): SeasonPicker {
  const seasons = inject(SeasonService);
  const route = inject(ActivatedRoute);
  const router = inject(Router);

  const seasons$ = seasons.seasons$ as Observable<Array<Partial<Season>>>;
  const season$ = route.queryParams.pipe(
    map((params) => params['season'] as string | undefined),
    distinctUntilChanged(),
    switchMap((guid) => (guid ? seasons$.pipe(map((list) => list.find((s) => s.guid === guid) ?? null)) : of(null))),
    // A season the address does not name, or names wrongly, is the active one.
    switchMap((named) => (named ? of(named) : (seasons.activeSeason$ as Observable<Partial<Season> | null>))),
    map((season) => season ?? null),
    shareReplay(1)
  );

  return {
    seasons$,
    season$,
    seasons: toSignal(seasons$, { initialValue: [] }),
    season: toSignal(season$, { initialValue: null }),
    choose(guid: string) {
      router.navigate([], { relativeTo: route, queryParams: { season: guid } });
    }
  };
}
