import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  public canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.isAuthenticated().pipe(
      map((result) => {
        // Extract any provided route data.
        const params: IGuardParams = route.data;

        // If auth returns successful response, proceed
        if (result.status) {
          return true;
        }

        // If auth failed and there is not a redirection parameter passed,
        // stop activation
        if (params.redirectTo === undefined) {
          return false;
        }

        // If auth failed and a redirect route was provided, redirect to it.
        const urlTree = this.router.parseUrl(params.redirectTo + `?ret=${window.location.href}`);

        return urlTree;
      })
    );
  }
}

interface IGuardParams {
  redirectTo?: string;
}
