import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import {
  AuthService as AS,
  AuthClientConfig,
  AppState,
  LogoutOptions,
  RedirectLoginOptions,
  User
} from '@auth0/auth0-angular';

import { ROLES_CLAIM } from '../../tokens/claims.token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly as = inject(AS);

  /**
   * False while the Auth0 domain is still a `___TOKEN___` placeholder: deployed images replace the
   * placeholders, a local serve without its own settings does not (#1522).
   */
  public readonly configured = !inject(AuthClientConfig).get()?.domain?.startsWith('___');

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
    if (!this.configured) {
      // Redirecting would send the browser to a host named after the placeholder.
      window.alert('Sign-in is not configured for this environment.');
      return;
    }

    this.as.loginWithRedirect(options);
  }

  public logout(options?: LogoutOptions) {
    this.as.logout(options);
  }
}
