import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private readonly oidcSecurityService: OidcSecurityService, private router: Router) {}

  public canActivate() {
    // TODO: At the moment this acts exactly like the AuthorizationGuard; need to implement authorization on IdP for AdminGuard - Aaron H (04/26/22)
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        // allow navigation if authenticated
        if (isAuthenticated) {
          return true;
        }

        // redirect if not authenticated
        return this.router.parseUrl('/forbidden');
      })
    );
  }
}
