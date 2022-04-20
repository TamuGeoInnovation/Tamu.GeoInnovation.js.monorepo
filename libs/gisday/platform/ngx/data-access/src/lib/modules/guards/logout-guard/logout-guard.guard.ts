import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {
  // constructor(private readonly authService: AuthService) {}
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return this.authService.state().pipe(
    //   map((value) => {
    //     if (value === true) {
    //       window.location.href = route.data['externalUrl'];
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   })
    // );
    this.oidcSecurityService.logoff();
    return true;
  }
}
