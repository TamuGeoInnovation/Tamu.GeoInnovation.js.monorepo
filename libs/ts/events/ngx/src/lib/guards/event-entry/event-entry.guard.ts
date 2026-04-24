import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

@Injectable({
  providedIn: 'root'
})
export class EventEntryGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    this.eventSettingsService.validateEventQueryParams(route, true);

    const eventPath = route.pathFromRoot
      .flatMap((snapshot) => snapshot.url.map((segment) => segment.path))
      .filter((segment) => segment.length > 0);

    const requestedPath = this.router.parseUrl(state.url).root.children['primary']?.segments.map((segment) => segment.path) ?? [];

    // Only intercept bare event URLs like /parking/avp-parking. Child routes such as /map and /builder should continue normally.
    if (requestedPath.length > eventPath.length) {
      return true;
    }

    const targetCommands =
      this.eventSettingsService.hasOptions && !this.eventSettingsService.hasFeatureSelectionQueryParams(route.queryParams)
        ? ['builder', 'accommodations']
        : ['map'];

    return this.router.createUrlTree(['/', ...eventPath, ...targetCommands], {
      queryParams: route.queryParams,
      fragment: route.fragment ?? undefined
    });
  }
}
