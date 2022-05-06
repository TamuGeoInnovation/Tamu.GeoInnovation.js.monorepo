import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard implements CanActivate {
  // TODO: Movomg this to oidc-ngx makes more sense to me if we wanna use it in more Angular apps - Aaron H (5/6/22)
  constructor(private oidcSecurityService: OidcSecurityService, private router: Router) {}

  public canActivate() {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        // allow navigation if authenticated
        if (isAuthenticated) {
          return true;
        }

        // redirect if not authenticated
        return this.router.parseUrl('/login');
      })
    );
  }
}
