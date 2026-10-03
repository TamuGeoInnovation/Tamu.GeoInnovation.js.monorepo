import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { EventSettingsService } from '../../services/settings/event-settings.service';

/** The child route that says an event has ended. */
export const ENDED_PATH = 'ended';

/**
 * A retired event does not open as a map (#1098).
 *
 * Its event is over and its services are often stopped, so its map, builder and bare link all land
 * on the ended page instead. The reverse holds too: the ended page belongs only to retired events, so
 * a current event's `/ended` goes back to the event itself.
 */
@Injectable({
  providedIn: 'root'
})
export class RetiredEventGuard  {
  constructor(private readonly router: Router, private readonly eventSettingsService: EventSettingsService) {}

  public canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    const eventRoute = childRoute.pathFromRoot.find((snapshot) => snapshot.params['eventId']);

    if (!eventRoute) {
      return true;
    }

    const definition = this.eventSettingsService.getEventDefinitionById(eventRoute.params['eventId']);
    const retired = definition?.discover?.status === 'retired';
    const onEndedPage = childRoute.routeConfig?.path === ENDED_PATH;

    if (retired === onEndedPage) {
      return true;
    }

    const eventPath = eventRoute.pathFromRoot.flatMap((snapshot) => snapshot.url.map((segment) => segment.path));

    return this.router.createUrlTree(['/', ...eventPath, ...(retired ? [ENDED_PATH] : [])]);
  }
}
