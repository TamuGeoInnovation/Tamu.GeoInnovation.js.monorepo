import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, catchError, map, of, pipe } from 'rxjs';

import { AuthService } from '@auth0/auth0-angular';

/**
 * Name of the claim/property in the users ID token (JWT) that contains the user's roles.
 *
 * Used by the `RoleGuard` to check if a user has any of the required roles.
 *
 **/
export const ROLES_CLAIM = new InjectionToken<string>('ROLES_CLAIM');

/**
 * Role guard that checks if a user has any of the required roles.
 *
 * IMPORTANT: Configure the `ROLES_CLAIM` injection token with the name of the claim that contains the user's roles.
 *
 * Optional: Pass in a `redirectTo` property in the route data to redirect to a specific route if the user is not authenticated or does not have the required roles.
 * If this property is provided, the guard will return a `UrlTree` instead of a `boolean`.
 *
 * @export
 * @class RoleGuard
 * @implements {CanActivate}
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(@Inject(ROLES_CLAIM) private readonly claim, private readonly as: AuthService, private readonly rt: Router) {}

  /**
   * Provide `{requiredRoles: ['role1', 'role2', ...]]}` as a route data property to
   * protect a route with the given set of roles.
   *
   * If a user is authenticated and has any of the required roles, the guard will return `true`.
   *
   * If a user is not authenticated or does not have the required roles, the guard will return `false`.
   *
   * If a user is not authenticated or does not have the required roles, and `redirectTo` property is provided the guard will redirect to the route specified.
   */
  public canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // List of required roles needs to be configured for each route as needed in their respective routing feature/root module
    const requiredRoles = route.data.requiredRoles as Array<string>;
    const redirectTo = route.data.redirectTo as string;

    return this.as.idTokenClaims$.pipe(
      map((user) => {
        if (user === null) {
          throw new Error('User is not authenticated');
        }

        return user[this.claim] as Array<string>;
      }),
      this.hasRequiredRoles(requiredRoles),
      catchError(() => {
        if (redirectTo) {
          return of(this.rt.parseUrl(redirectTo));
        } else {
          return of(false);
        }
      })
    );
  }

  /**
   * Test if any of the provided user roles exist in the list of required roles.
   */
  private hasRequiredRoles(requiredRoles: Array<string>) {
    return pipe(
      map((userClaims: Array<string>) => {
        const hasRole = requiredRoles.some((requiredRole) => {
          return userClaims.includes(requiredRole);
        });

        if (hasRole) {
          return true;
        } else {
          throw new Error('User is not authenticated');
        }
      })
    );
  }
}

