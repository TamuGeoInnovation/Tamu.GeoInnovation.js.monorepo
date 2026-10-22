import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SeasonService, ViewedSeason, seasonYearFromRoute } from './season.service';

/**
 * A route tree as the router builds it: each level carries only its own parameters, so the year sits
 * on the `seasons/:seasonYear` level and the page is several levels below it.
 */
const routeTree = (...levels: Array<Record<string, string>>) => {
  const snapshots = levels.map((params) => ({ paramMap: convertToParamMap(params) }) as ActivatedRouteSnapshot);

  snapshots.forEach((snapshot, i) => {
    Object.defineProperty(snapshot, 'firstChild', { value: snapshots[i + 1] ?? null });
    Object.defineProperty(snapshot, 'root', { value: snapshots[0] });
  });

  return snapshots;
};

describe('seasonYearFromRoute', () => {
  it('finds the year on an ancestor of the page', () => {
    const [root] = routeTree({}, { seasonYear: '2025' }, {}, {});

    expect(seasonYearFromRoute(root)).toBe(2025);
  });

  it('answers null outside a past year', () => {
    const [root] = routeTree({}, {}, {});

    expect(seasonYearFromRoute(root)).toBeNull();
  });
});

describe('SeasonService', () => {
  let service: SeasonService;
  let http: HttpTestingController;

  const active = { guid: 'season-2026', year: 2026, days: [], firstEventTime: null };
  const past = { guid: 'season-2025', year: 2025, days: [], firstEventTime: '09:00' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SeasonService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  /**
   * Regression coverage (#2076). On a new site with no season, `/seasons/active` answers 404. That ended
   * `activeSeason$` with an error, so everything built on it never had a value: the Sessions filters
   * spun for ever and the day list stayed blank. No active season is an answer, `null`, that a page can
   * show a message for.
   */
  describe('.activeSeason$ on a site with no season', () => {
    const noSeason = () =>
      http.expectOne('api/seasons/active').flush('No active season.', { status: 404, statusText: 'Not Found' });

    it('is null, not an error', async () => {
      const result = firstValueFrom(service.activeSeason$);

      noSeason();

      await expect(result).resolves.toBeNull();
    });

    it('gives a page opened with no year a null season', async () => {
      const page = routeTree({}, {})[1];
      const result = firstValueFrom(service.seasonForRoute(page));

      noSeason();

      await expect(result).resolves.toEqual({ year: null, season: null, isPast: false });
    });

    it('still fails on any other error, which is not "no season"', async () => {
      const result = firstValueFrom(service.activeSeason$);

      http.expectOne('api/seasons/active').flush('Down.', { status: 500, statusText: 'Server Error' });

      await expect(result).rejects.toBeTruthy();
    });
  });

  describe('.isPastSeasonDay()', () => {
    const withDays = { ...active, days: [{ guid: 'day-2026-1' }, { guid: 'day-2026-2' }] };

    it("is true for a day that is not one of the active season's", async () => {
      const result = firstValueFrom(service.isPastSeasonDay('day-2025-1'));

      http.expectOne('api/seasons/active').flush(withDays);

      await expect(result).resolves.toBe(true);
    });

    it("is false for one of the active season's days", async () => {
      const result = firstValueFrom(service.isPastSeasonDay('day-2026-2'));

      http.expectOne('api/seasons/active').flush(withDays);

      await expect(result).resolves.toBe(false);
    });

    it('is false for a session with no day', async () => {
      const result = firstValueFrom(service.isPastSeasonDay(undefined));

      http.expectOne('api/seasons/active').flush(withDays);

      await expect(result).resolves.toBe(false);
    });
  });

  describe('.seasonForRoute()', () => {
    /**
     * Regression coverage (#1758). Moving from 2025's Sessions to 2024's showed 2024 in the header
     * and 2025's sessions on the page: the page started before the navigation ended, and read the
     * season the visitor was leaving. A page now reads the year from the route being opened.
     */
    it("loads the year in the route being opened, not the year being left", async () => {
      const page = routeTree({}, { seasonYear: '2024' }, {})[2];
      const result = firstValueFrom(service.seasonForRoute(page));

      http.expectOne('api/seasons/year/2024').flush({ ...past, guid: 'season-2024', year: 2024 });
      http.expectOne('api/seasons/active').flush(active);

      await expect(result).resolves.toEqual<ViewedSeason>({
        year: 2024,
        season: expect.objectContaining({ year: 2024 }),
        isPast: true
      });
    });

    it('loads the active season when the route has no year', async () => {
      const page = routeTree({}, {})[1];
      const result = firstValueFrom(service.seasonForRoute(page));

      http.expectOne('api/seasons/active').flush(active);

      await expect(result).resolves.toEqual({ year: null, season: active, isPast: false });
    });

    it('is not a past year when the year in the route is the active one', async () => {
      const page = routeTree({ seasonYear: '2026' })[0];
      const result = firstValueFrom(service.seasonForRoute(page));

      http.expectOne('api/seasons/year/2026').flush(active);
      http.expectOne('api/seasons/active').flush(active);

      await expect(result).resolves.toEqual(expect.objectContaining({ isPast: false }));
    });

    it('answers a null season for a year with none, so the page can say so', async () => {
      const page = routeTree({ seasonYear: '1999' })[0];
      const result = firstValueFrom(service.seasonForRoute(page));

      http.expectOne('api/seasons/year/1999').flush('No season found for 1999.', { status: 404, statusText: 'Not Found' });
      http.expectOne('api/seasons/active').flush(active);

      await expect(result).resolves.toEqual({ year: 1999, season: null, isPast: true });
    });
  });
});
