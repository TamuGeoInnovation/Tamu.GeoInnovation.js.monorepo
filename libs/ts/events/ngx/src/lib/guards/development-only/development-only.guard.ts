import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { EventSettingsService } from '../../services/settings/event-settings.service';

/**
 * A development-only map does not open where development-only features are off (#2712).
 *
 * Its link goes to the main map instead, before the map or its builder loads, so production never requests
 * the map's services. The map's `developmentOnly` says which issue keeps it there.
 *
 * A page that is not a map is development-only by `developmentOnly` in its route's `data`, saying why, and goes back to
 * the page above it instead (#2788): the Transportation section of All Maps goes back to All Maps.
 */
@Injectable({
  providedIn: 'root'
})
export class DevelopmentOnlyMapGuard {
  private readonly router = inject(Router);
  private readonly testing = inject(TestingService);
  private readonly eventSettingsService = inject(EventSettingsService);

  public canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (this.testing.isTesting) {
      return true;
    }

    if (route.data?.['developmentOnly']) {
      return this.router.createUrlTree([
        '/',
        ...route.pathFromRoot.slice(0, -1).flatMap((step) => step.url.map((segment) => segment.path))
      ]);
    }

    const definition = this.eventSettingsService.getEventDefinitionById(route.params['eventId']);

    return !definition?.developmentOnly ? true : this.router.createUrlTree(['/map']);
  }
}
