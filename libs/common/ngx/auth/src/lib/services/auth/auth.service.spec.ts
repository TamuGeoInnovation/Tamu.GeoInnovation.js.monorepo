import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService as AS, AuthClientConfig } from '@auth0/auth0-angular';

import { ROLES_CLAIM } from '../../tokens/claims.token';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let loginWithRedirect: Mock;

  function serviceFor(domain: string): AuthService {
    loginWithRedirect = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: AS, useValue: { user$: of(null), isAuthenticated$: of(false), idTokenClaims$: of(null), loginWithRedirect } },
        { provide: AuthClientConfig, useValue: { get: () => ({ domain, clientId: 'client' }) } },
        { provide: ROLES_CLAIM, useValue: 'roles' }
      ]
    });

    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // #1522: served locally, the domain was still its placeholder and Login sent the browser to a host
  // of that name.
  it('does not redirect to sign in while the Auth0 domain is an unreplaced placeholder', () => {
    const service = serviceFor('___ANGULAR_AUTH0_DOMAIN___');

    service.login();

    expect(loginWithRedirect).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Sign-in is not configured for this environment.');
  });

  it('redirects to sign in when the Auth0 domain is set', () => {
    const service = serviceFor('auth.example.org');
    const options = { appState: { target: '/sessions' } };

    service.login(options);

    expect(loginWithRedirect).toHaveBeenCalledWith(options);
    expect(window.alert).not.toHaveBeenCalled();
  });
});
