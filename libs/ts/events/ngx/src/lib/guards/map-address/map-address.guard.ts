import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

/**
 * The first segment of a map's address (#2767).
 *
 * A map listed in All Maps' Transportation section is at `/transportation/<id>`, whatever its `type`: the section
 * decides, so a map cannot be listed under Transportation while its address says parking. Every other map is under
 * its type, as it always was: `event` at `/events`, `satellite-campus` at `/campus`, the rest at their own name.
 */
export function mapSegment(discover: { type: string; mapType?: string; mapTypes?: readonly string[] }): string {
  if ((discover.mapTypes ?? [discover.mapType]).includes('transportation')) {
    return 'transportation';
  }

  return discover.type === 'event' ? 'events' : discover.type === 'satellite-campus' ? 'campus' : discover.type;
}

/**
 * A Transportation map reached at another segment, such as its old `/parking/<id>`, moves to `/transportation/<id>`,
 * keeping the rest of the address (#2767). Only Transportation maps move: a parking map's `/events/<id>` link has
 * always worked and is left alone.
 */
@Injectable({
  providedIn: 'root'
})
export class MapAddressGuard {
  private readonly router = inject(Router);
  private readonly eventSettingsService = inject(EventSettingsService);

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const discover = this.eventSettingsService.getEventDefinitionById(route.params['eventId'])?.discover;
    const segment = state.url.split(/[/?#]/)[1];

    return !discover || mapSegment(discover) !== 'transportation' || segment === 'transportation'
      ? true
      : this.router.parseUrl(state.url.replace(/^\/[^/?#]+/, '/transportation'));
  }
}
