import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {
  private accessToken: string;
  private idToken$: Observable<string>;

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private readonly env: EnvironmentService,
    private router: Router
  ) {
    this.accessToken = this.oidcSecurityService.getAccessToken();
  }

  public canActivate() {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(async ({ isAuthenticated }) => {
        // allow navigation if authenticated
        if (isAuthenticated) {
          return true;
        }

        // redirect if not authenticated
        return this.router.parseUrl('/login');
      }),
      mergeMap((result) => result)
    );
  }
}

// this.accessToken$ = this.oidcSecurityService.getAccessToken();
// this.idToken$ = this.oidcSecurityService.getIdToken()

