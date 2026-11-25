import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { TRIP_FROM_STOP_SEARCH } from './omnisearch.component';

@Component({ template: '' })
class Page {
  public readonly route = inject(ActivatedRoute);
}

/**
 * Back to the phone's trip planner from a stop's search (#3149). The phone's search for a trip stop is
 * /map/m/search/:id, its page an empty-path child, and the trip planner /map/m/trip. The search sent a chosen stop to
 * the desktop's /map/d/trip, which only worked because the desktop guard sent it back; and its own back arrow used
 * ['./trip'], which from there is /map/m/search/:id/trip and no page at all. The routes below are the map's own shape.
 */
describe('the trip planner, from a stop search on a phone', () => {
  async function fromStopSearch() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'map',
            children: [
              {
                path: 'm',
                children: [
                  { path: 'trip', component: Page },
                  { path: 'search/:id', children: [{ path: '', component: Page }] }
                ]
              }
            ]
          }
        ])
      ]
    });

    const page = await (await RouterTestingHarness.create()).navigateByUrl('/map/m/search/1', Page);
    const router = TestBed.inject(Router);

    return (commands: Array<string>) => router.serializeUrl(router.createUrlTree(commands, { relativeTo: page.route }));
  }

  it("is the phone's own trip planner", async () => {
    const resolve = await fromStopSearch();

    expect(resolve(TRIP_FROM_STOP_SEARCH)).toBe('/map/m/trip');
  });

  it("is not where ['./trip'] goes from there, which is no page", async () => {
    const resolve = await fromStopSearch();

    expect(resolve(['./trip'])).toBe('/map/m/search/1/trip');
  });
});
