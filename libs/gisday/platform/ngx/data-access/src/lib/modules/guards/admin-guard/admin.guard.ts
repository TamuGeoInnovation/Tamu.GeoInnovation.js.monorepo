import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  // constructor(private readonly authService: AuthService) {}
  constructor(private readonly oidcSecurityService: OidcSecurityService, private router: Router) {}

  // public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  //   return this.authService.getUserRole().pipe(
  //     map((value) => {
  //       if (value.role.level_role === '99') {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     })
  //   );
  // }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
