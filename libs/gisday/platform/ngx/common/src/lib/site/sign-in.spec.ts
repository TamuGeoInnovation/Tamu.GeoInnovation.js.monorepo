import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { gisdaySite } from '@tamu-gisc/gisday/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { GISDAY_SITE } from './site';
import { ALREADY_SIGNED_IN_PATH, logOut, startSignIn } from './sign-in';

@Component({ template: 'page' })
class PageComponent {}

/**
 * #3148: `/login` and `/signup` start signing in, as the header's Login/Signup does, and bring the visitor back. The FAQ
 * page's links to them led to "not found" (`/signup`) and an empty page (`/login`).
 *
 * #3154: a visitor already signed in was sent to Auth0 and straight back, so the link seemed to do nothing. They are
 * told they are signed in instead, with Continue to the site and Log out; and `/logout` logs out, as the header does.
 */
describe('startSignIn, the /login and /signup routes', () => {
  function setUp(signedIn = false) {
    const login = vi.fn();
    const logout = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'faq', component: PageComponent },
          { path: '', component: PageComponent },
          { path: ALREADY_SIGNED_IN_PATH, component: PageComponent },
          { path: 'login', canActivate: [startSignIn], children: [] },
          { path: 'signup', canActivate: [startSignIn], children: [] },
          { path: 'logout', canActivate: [logOut], children: [] }
        ]),
        { provide: AuthService, useValue: { login, logout, isAuthenticated$: of(signedIn) } },
        { provide: ModalService, useValue: { open: vi.fn(() => of(true)) } },
        { provide: GISDAY_SITE, useValue: gisdaySite('tamu') }
      ]
    });

    return { login, logout, router: TestBed.inject(Router) };
  }

  it.each(['/signup', '/login'])('followed from a page, %s starts signing in, back to that page, and stays on it', async (to) => {
    const { login, router } = setUp();

    await router.navigateByUrl('/faq');
    await router.navigateByUrl(to);

    expect(login).toHaveBeenCalledWith({ appState: { target: '/faq' } });
    expect(router.url).toBe('/faq');
  });

  it('reached directly, starts signing in and waits on the home page', async () => {
    const { login, router } = setUp();

    await router.navigateByUrl('/signup');

    expect(login).toHaveBeenCalledWith({ appState: { target: '/' } });
    expect(router.url).toBe('/');
  });

  it.each(['/signup', '/login'])('signed in already, %s says so instead of signing in again (#3154)', async (to) => {
    const { login, router } = setUp(true);

    await router.navigateByUrl('/faq');
    await router.navigateByUrl(to);

    expect(login).not.toHaveBeenCalled();
    expect(router.url).toBe(`/${ALREADY_SIGNED_IN_PATH}`);
  });

  it('logs out at /logout, back to the site, as the header does (#3154)', async () => {
    const { logout, router } = setUp(true);

    await router.navigateByUrl('/logout');

    expect(logout).toHaveBeenCalledWith({ logoutParams: { returnTo: window.location.origin } });
  });
});
