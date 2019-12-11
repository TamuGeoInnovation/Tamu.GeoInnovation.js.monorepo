import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Data,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';

import { Device } from '@tamu-gisc/common/utils/device';

@Injectable({ providedIn: 'root' })
export class DeviceGuard implements CanActivate, CanActivateChild {
  private deviceTests = {
    standalone: [new Device().standalone]
  };
  constructor(private router: Router) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowed = this.isDeviceAuthorized(next.data);

    if (allowed) {
      if (next.data && (<IDeviceGuardOptions>next.data).devicePassRedirect) {
        return this.router.parseUrl((<IDeviceGuardOptions>next.data).devicePassRedirect);
      } else {
        return allowed;
      }
    } else {
      if (next.data) {
        if ((<IDeviceGuardOptions>next.data).deviceIgnoreFailRedirect) {
          return true;
        } else if ((<IDeviceGuardOptions>next.data).deviceFailRedirect) {
          return this.router.parseUrl((<IDeviceGuardOptions>next.data).deviceFailRedirect);
        } else {
          throw new Error('Device guard returned false for the requested route, and no redirect was provided.');
        }
      }
    }
  }

  public canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isDeviceAuthorized(next.data);
  }

  private isDeviceAuthorized(options?: IDeviceGuardOptions): boolean {
    if (options && options.deviceModes) {
      // Check that all provided device modes are valid.
      // Cannot call the reference to a device mode that does not exist.
      const providedModesValid: boolean = options.deviceModes.every((mode) => Object.keys(this.deviceTests).includes(mode));

      if (!providedModesValid) {
        console.warn('At least one device mode was not recognized. Denying route access.');
        return false;
      }

      // For every mode provided, execute its tests
      const passAllTests: boolean = options.deviceModes.every((mode) => {
        return this.deviceTests[mode].some(function(fn) {
          return fn();
        });
      });

      return passAllTests;
    }
  }
}

export interface IDeviceGuardOptions extends Data {
  /**
   * Route to be re-routed to if the device *FAILS* the authorized test.
   */
  devicePassRedirect?: string;

  /**
   * Route to be re-routed to if the device *PASSES* the authorized test.
   */
  deviceFailRedirect?: string;

  /**
   * Property that describes whether the guard will redirect on a guard fail test.
   *
   * This is useful when the origin (callee) and target routes require the same device test,
   * and under certain conditions would fail regardless. This would create a redirection loop
   * or application-breaking error.
   *
   */
  deviceIgnoreFailRedirect?: boolean;

  deviceModes?: ['standalone'];
}
