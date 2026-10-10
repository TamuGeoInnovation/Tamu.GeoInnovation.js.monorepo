import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { delay, Observable, of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventSettings } from '../../interfaces/special-event.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsGuard  {
  private readonly router = inject(Router);
  private readonly ess = inject(EventSettingsService);
  private readonly ns = inject(NotificationService);
  private readonly anl = inject(Angulartics2);


  public canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Settings can come from either local storage or from the url query parameters
    const appSettings = this.ess.settings();
    const queryParams = route.queryParams as EventSettings;
    const queryParamsKeySize = Object.keys(queryParams).length;

    if (!appSettings && queryParamsKeySize === 0) {
      return true;
    }

    try {
      // Call event settings service to update and set/overwrite any settings in local storage.
      //
      // Only params keyed to a configurable option count as settings. A link that carries just a
      // feature deep-link (e.g. `?feature=Move-In Lots:34815`) would otherwise be read as an empty
      // set of selections and wipe whatever the visitor already had saved.
      if (this.ess.hasSettingsQueryParams(queryParams)) {
        this.ess.setSettingsFromQueryParams(queryParams);

        this.anl.eventTrack.next({
          action: 'settings_load',
          properties: {
            category: 'url',
            gstCustom: { ...queryParams }
          }
        });

        return of(true).pipe(delay(100)); // Add artificial delay to allow settings to be set before proceeding.
      } else if (appSettings) {
        return of(true).pipe(delay(100)); // Add artificial delay to allow settings to be set before proceeding.
      }

      // Nothing to restore from either source; the map handles the unconfigured case.
      return true;
    } catch (err) {
      this.ns.toast({
        id: 'special-events-settings-error',
        title: 'Error Validating URL Parameters',
        message: 'Could not load map from URL parameters. Please set your preferences manually using the map configurator.'
      });

      return this.router.parseUrl('/builder');
    }
  }
}
