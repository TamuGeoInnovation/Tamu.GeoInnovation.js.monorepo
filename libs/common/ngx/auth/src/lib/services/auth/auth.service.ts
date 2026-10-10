import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { AuthService as AS, AppState, LogoutOptions, RedirectLoginOptions, User } from '@auth0/auth0-angular';

import { ROLES_CLAIM } from '../../tokens/claims.token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly as = inject(AS);

  public user$: Observable<User>;
  public isAuthenticated$: Observable<boolean>;
  public userRoles$: Observable<Array<string>>;

  constructor() {
    const claim = inject(ROLES_CLAIM);

    this.user$ = this.as.user$.pipe(shareReplay());

    this.isAuthenticated$ = this.as.isAuthenticated$.pipe(shareReplay());

    this.userRoles$ = this.as.idTokenClaims$.pipe(
      map((user) => {
        return user?.[claim] || [];
      })
    );
  }

  public login(options?: RedirectLoginOptions<AppState>) {
    this.as.loginWithRedirect(options);
  }

  public logout(options?: LogoutOptions) {
    this.as.logout(options);
  }
}
