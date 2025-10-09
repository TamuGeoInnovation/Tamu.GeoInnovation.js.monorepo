import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard  {
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
