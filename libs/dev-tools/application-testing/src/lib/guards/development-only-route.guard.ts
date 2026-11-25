import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TestingService } from '../services/application-testing.service';

/**
 * A page that is development-only does not open where development-only features are off (#2788, #2801).
 *
 * Put it on the route with `developmentOnly` in the route's `data`, saying why. Hiding the page's link is not enough:
 * the page still answers its address. Elsewhere it goes one segment up the address, to the page that would have linked
 * to it - `/all-maps/transportation` to All Maps, `/map/d/trip/options` to the trip planner. One segment, not one
 * route, because a route's path can be several segments (`trip/options`).
 */
export const developmentOnlyRoute: CanActivateFn = (route) => {
  if (inject(TestingService).isTesting) {
    return true;
  }

  const segments = route.pathFromRoot.flatMap((step) => step.url.map((segment) => segment.path));

  return inject(Router).createUrlTree(['/', ...segments.slice(0, -1)]);
};
