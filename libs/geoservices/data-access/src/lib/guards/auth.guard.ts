import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, CanLoad, CanActivateChild, Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private auth: AuthService, private router: Router) {}

  public canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._authorized;
  }

  public canActivateChild(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this._authorized;
  }

  public canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

  private get _authorized(): Observable<boolean | UrlTree> {
    return this.auth.state.pipe(
      switchMap((s) => {
        if (s.loggedIn === true) {
          return of(s.loggedIn);
        } else {
          return of(this.router.parseUrl('api'));
        }
      })
    );
  }
}
