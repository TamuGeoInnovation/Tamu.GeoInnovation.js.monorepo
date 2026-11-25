import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, UrlTree, Data, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Device } from '@tamu-gisc/common/utils/device';

@Injectable({ providedIn: 'root' })
export class DeviceGuard {
  private router = inject(Router);

  private deviceTests = {
    standalone: [new Device().standalone]
  };

  public canActivate(
    next: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowed = this.isDeviceAuthorized(next.data);
    const options = next.data as IDeviceGuardOptions | undefined;

    if (allowed) {
      const passRedirect = options?.devicePassRedirect;

      if (passRedirect) {
        return this.router.parseUrl(passRedirect);
      } else {
        return allowed;
      }
    } else {
      if (options) {
        const failRedirect = options.deviceFailRedirect;

        if (options.deviceIgnoreFailRedirect) {
          return true;
        } else if (failRedirect) {
          return this.router.parseUrl(failRedirect);
        } else {
          throw new Error('Device guard returned false for the requested route, and no redirect was provided.');
        }
      }

      // A route with no data at all is refused, as the undefined this used to return was (#3610).
      return false;
    }
  }

  public canActivateChild(
    next: ActivatedRouteSnapshot
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
        return this.deviceTests[mode].some(function (fn) {
          return fn();
        });
      });

      return passAllTests;
    }

    // No device modes asked for: not authorized, as the undefined this used to return was taken to be (#3610).
    return false;
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
