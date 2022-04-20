import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { map } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  // constructor(private readonly authService: AuthService) {}
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return this.oidcSecurityService.isAuthenticated();
    // if (this.oidcSecurityService.isAuthenticated) {
    //   console.log('is authenticated somehow');
    //   return true;
    // } else {
    //   console.log('not authenticated, redirecting?');
    //   window.location.href = route.data['externalUrl'];
    //   return true;
    // }

    // const $isLoading = this.oidcSecurityService.isLoading$;
    this.oidcSecurityService.authorize();
    return true;
    // this.oidcSecurityService.authorize();
    //   return this.authService.state().pipe(
    //     map((value) => {
    //       if (value === false) {
    //         window.location.href = route.data['externalUrl'];
    //         return true;
    //       } else {
    //         return true;
    //       }
    //     })
    //   );
  }
}
