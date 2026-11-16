import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { gisdaySite } from '@tamu-gisc/gisday/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { GISDAY_SITE } from './site';
import { startSignIn } from './sign-in';

@Component({ template: 'page' })
class PageComponent {}

/**
 * #3148: `/login` and `/signup` start signing in, as the header's Login/Signup does, and bring the visitor back. The FAQ
 * page's links to them led to "not found" (`/signup`) and an empty page (`/login`).
 */
describe('startSignIn, the /login and /signup routes', () => {
  function setUp() {
    const login = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'faq', component: PageComponent },
          { path: '', component: PageComponent },
          { path: 'login', canActivate: [startSignIn], children: [] },
          { path: 'signup', canActivate: [startSignIn], children: [] }
        ]),
        { provide: AuthService, useValue: { login } },
        { provide: ModalService, useValue: { open: jest.fn(() => of(true)) } },
        { provide: GISDAY_SITE, useValue: gisdaySite('tamu') }
      ]
    });

    return { login, router: TestBed.inject(Router) };
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
});
