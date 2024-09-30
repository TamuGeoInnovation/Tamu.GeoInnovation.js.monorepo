import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { delay, Observable, of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { QueryParamSettings } from '../../interfaces/ring-day.interface';
import { MoveInOutSettingsService } from '../../modules/map/services/move-in-out-settings/move-in-out-settings.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanActivate {
  constructor(
    private readonly mioSettings: MoveInOutSettingsService,
    private readonly router: Router,
    private readonly ns: NotificationService,
    private readonly anl: Angulartics2
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Settings can come from either local storage or from the url query parameters
    const moveinSettings = this.mioSettings.settings;
    const queryParams = route.queryParams as QueryParamSettings;
    const queryParamsKeySize = Object.keys(queryParams).length;

    if (!moveinSettings && queryParamsKeySize === 0) {
      return this.router.parseUrl('/builder');
    }

    try {
      // Call move-in/out settings service to update and set/overwrite any settings in local storage.
      if (queryParamsKeySize) {
        this.mioSettings.setSettingsFromQueryParams(queryParams);

        this.anl.eventTrack.next({
          action: 'settings_load',
          properties: {
            category: 'url',
            gstCustom: { ...queryParams }
          }
        });

        return of(true).pipe(delay(100)); // Add artificial delay to allow settings to be set before proceeding.
      } else if (moveinSettings) {
        return of(true).pipe(delay(100)); // Add artificial delay to allow settings to be set before proceeding.
      }
    } catch (err) {
      this.ns.toast({
        id: 'movein-settings-error',
        title: 'Error Validating URL Parameters',
        message: 'Could not load map from URL parameters. Please set your preferences manually using the map configurator.'
      });

      return this.router.parseUrl('/builder');
    }

    return false;
  }
}
