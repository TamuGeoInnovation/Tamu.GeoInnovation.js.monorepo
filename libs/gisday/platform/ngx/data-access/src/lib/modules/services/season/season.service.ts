import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  tap
} from 'rxjs';

import { ActiveSeasonDto, Season } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

/**
 * The route parameter a past year's pages carry, as in `seasons/:seasonYear/sessions` (#1758).
 */
export const SEASON_YEAR_PARAM = 'seasonYear';

/**
 * Reads the season year from the deepest route that has one, or null when no route does.
 */
export function seasonYearFromRoute(root: ActivatedRouteSnapshot): number | null {
  let year: string | null = null;

  for (let route = root; route; route = route.firstChild) {
    year = route.paramMap.get(SEASON_YEAR_PARAM) ?? year;
  }

  return year === null ? null : Number(year);
}

/**
 * The season a page shows. `season` is null when the year in the address has no season, and `isPast`
 * is true for any year but the active one.
 */
export interface ViewedSeason {
  year: number | null;
  season: ActiveSeasonDto | null;
  isPast: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonService extends BaseService<Season> {
  private http1 = inject(HttpClient);
  private router = inject(Router);

  private _signal$: Subject<void> = new Subject();

  public seasons$: Observable<Array<Partial<Season>>> = this._signal$.pipe(
    startWith(null),
    switchMap(() => this.getEntities()),
    shareReplay(1)
  );
  public activeSeason$: Observable<ActiveSeasonDto> = this._signal$.pipe(
    startWith(null),
    switchMap(() => this.getActiveSeason()),
    shareReplay(1)
  );

  /**
   * The year in the address on a past year's pages (2025 for `/seasons/2025/sessions`), or null
   * everywhere else.
   */
  public viewedYear$: Observable<number | null> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => seasonYearFromRoute(this.router.routerState.snapshot.root)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  /**
   * The season the visitor is looking at: the year in the address, or the active season when there
   * is none. Null when the address names a year with no season. The header, footer and the Sessions,
   * Presenters and Sponsors pages all read this, so they cannot disagree about which year is shown.
   */
  public viewedSeason$: Observable<ActiveSeasonDto | null> = this.viewedYear$.pipe(
    switchMap((year) => {
      if (year === null) {
        return this.activeSeason$;
      }

      return this.getSeasonByYear(year).pipe(catchError(() => of(null)));
    }),
    shareReplay(1)
  );

  /**
   * True on any year but the active one, where registering and this year's sponsor information do
   * not apply.
   */
  public isPastSeason$: Observable<boolean> = combineLatest([
    this.viewedYear$,
    this.viewedSeason$,
    this.activeSeason$
  ]).pipe(
    map(([year, viewed, active]) => year !== null && viewed?.guid !== active?.guid),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor() {
    super('seasons');
  }

  public getActiveSeason() {
    return this.http1.get<ActiveSeasonDto>(this.resource + '/active');
  }

  public getSeasonByYear(year: number) {
    return this.http1.get<ActiveSeasonDto>(`${this.resource}/year/${year}`);
  }

  /**
   * True when a season day is not one of the active season's days, so the session on it is from a past
   * year and can no longer be registered or checked in for (#1758). A session with no day is not
   * treated as past.
   */
  public isPastSeasonDay(dayGuid: string | undefined): Observable<boolean> {
    return this.activeSeason$.pipe(
      take(1),
      map((active) => Boolean(dayGuid) && !(active?.days ?? []).some((day) => day.guid === dayGuid))
    );
  }

  /**
   * The season a page is opened for, read from the route being opened rather than from
   * `viewedSeason$`: a page starts before the navigation ends, while `viewedSeason$` still holds the
   * year the visitor is leaving.
   */
  public seasonForRoute(route: ActivatedRouteSnapshot): Observable<ViewedSeason> {
    const year = seasonYearFromRoute(route.root);

    if (year === null) {
      return this.activeSeason$.pipe(
        take(1),
        map((season) => ({ year, season, isPast: false }))
      );
    }

    return combineLatest([this.getSeasonByYear(year).pipe(catchError(() => of(null))), this.activeSeason$]).pipe(
      take(1),
      map(([season, active]) => ({ year, season, isPast: season?.guid !== active?.guid }))
    );
  }

  public override createEntity(newEntity?: Partial<Season>) {
    return this.http1.post<Partial<Season>>(this.resource, newEntity).pipe(tap(() => this._signal$.next()));
  }

  public override updateEntity(guid: string, updatedEntity: Partial<Season>) {
    return this.http1
      .patch<Partial<Season>>(`${this.resource}/${guid}`, updatedEntity)
      .pipe(tap(() => this._signal$.next()));
  }

  public override deleteEntity(entityGuid: string) {
    return this.http1.delete<Partial<Season>>(`${this.resource}/${entityGuid}`).pipe(tap(() => this._signal$.next()));
  }
}
