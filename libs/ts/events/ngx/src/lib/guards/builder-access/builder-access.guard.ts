import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

@Injectable({
  providedIn: 'root'
})
export class BuilderAccessGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const eventRoute = route.parent ?? route;

    this.eventSettingsService.validateEventQueryParams(eventRoute, true);

    if (this.eventSettingsService.hasOptions) {
      return true;
    }

    const eventPath = eventRoute.pathFromRoot
      .flatMap((snapshot) => snapshot.url.map((segment) => segment.path))
      .filter((segment) => segment.length > 0);

    return this.router.createUrlTree(['/', ...eventPath, 'map'], {
      queryParams: route.queryParams,
      fragment: route.fragment ?? undefined
    });
  }
}
