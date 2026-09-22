import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { getUrlSegmentsFromRouteSnapshot } from '@tamu-gisc/common/utils/routing';

import { EventSettingsService } from '../../services/settings/event-settings.service';

/**
 * Replaces the unconditional `redirectTo: 'd'` default child route of the event map. Most events
 * always want the desktop/mobile sidebar shell, so this guard reproduces that default behavior —
 * except for events configured with `EventConfiguration.hideSidebar`, where it deliberately does
 * nothing, leaving the sidebar's router-outlet empty so no sidebar shell (and none of its overlay
 * buttons) ever mounts.
 *
 * `DesktopGuard`/`MobileGuard`, guarding `d`'s and `m`'s own children, still resolve which of the
 * two shells actually renders once we navigate into `d`.
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarRedirectGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly eventSettingsService: EventSettingsService) {}

  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const hideSidebar = this.eventSettingsService.eventConfiguration()?.configuration?.hideSidebar === true;

    if (hideSidebar) {
      // No navigation — the route resolves with nothing rendered in this outlet.
      return true;
    }

    const segments = getUrlSegmentsFromRouteSnapshot(route);
    this.router.navigate(['/', ...segments, 'd'], { queryParams: route.queryParams });

    return false;
  }
}
