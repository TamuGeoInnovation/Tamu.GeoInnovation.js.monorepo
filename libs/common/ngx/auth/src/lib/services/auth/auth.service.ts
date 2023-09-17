import { Inject, Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { AuthService as AS, AppState, LogoutOptions, RedirectLoginOptions, User } from '@auth0/auth0-angular';

import { ROLES_CLAIM } from '../../tokens/claims.token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User>;
  public isAuthenticated$: Observable<boolean>;
  public userRoles$: Observable<Array<string>>;

  constructor(@Inject(ROLES_CLAIM) claim: string, private readonly as: AS) {
    this.user$ = this.as.user$.pipe(shareReplay());

    this.isAuthenticated$ = this.as.isAuthenticated$.pipe(shareReplay());

    this.userRoles$ = this.as.idTokenClaims$.pipe(
      map((user) => {
        return user[claim];
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

