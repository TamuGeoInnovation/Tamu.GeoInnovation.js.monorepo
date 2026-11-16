import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { discoverRoutes } from './discover.routes';

/**
 * The addresses All Maps serves.
 *
 * The section listing the parking and transportation maps was renamed from `parking` to
 * `parking-transportation` in #2910, because the page had stopped being only about parking: since #2895 it
 * lists Buses & Transportation above Parking. The old address is kept, and these tests are what keep it:
 * it has been the parking listing's address for years and is linked from outside this repository, so the
 * next person to tidy this table should fail a test rather than a visitor's link.
 *
 * Navigation here resolves the route table without rendering anything, because the test has no router
 * outlet for the router to activate a component into - which is the point: it is the addresses under test,
 * not the pages.
 */
describe('discoverRoutes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'all-maps', children: discoverRoutes }])]
    });

    router = TestBed.inject(Router);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('serves the parking and transportation maps at /all-maps/parking-transportation', async () => {
    expect(await router.navigateByUrl('/all-maps/parking-transportation')).toBe(true);
    expect(router.url).toBe('/all-maps/parking-transportation');
  });

  it('still answers the old /all-maps/parking, at the same page', async () => {
    expect(await router.navigateByUrl('/all-maps/parking')).toBe(true);

    expect(router.url).toBe('/all-maps/parking-transportation');
  });

  it('keeps a query string and a fragment across that redirect', async () => {
    // A link shared with `?as=production` or an anchor is still a link somebody sent somebody else.
    await router.navigateByUrl('/all-maps/parking?as=production#parking');

    expect(router.url).toBe('/all-maps/parking-transportation?as=production#parking');
  });

  it('redirects only the listing itself, not every address beginning with it', async () => {
    // `pathMatch: 'full'`: the redirect answers `/all-maps/parking` and nothing below it, so a future
    // child route does not disappear into the rename.
    const parking = discoverRoutes.find((route) => route.path === 'parking');

    expect(parking?.redirectTo).toBe('parking-transportation');
    expect(parking?.pathMatch).toBe('full');
  });

  it('leaves the other listings at their own addresses', async () => {
    // The rename was one section's. These are the addresses the tiles and outside links use.
    for (const path of ['campus-events', 'athletics-events', 'operations', '150', 'campus']) {
      expect(await router.navigateByUrl(`/all-maps/${path}`)).toBe(true);
      expect(router.url).toBe(`/all-maps/${path}`);
    }
  });
});
