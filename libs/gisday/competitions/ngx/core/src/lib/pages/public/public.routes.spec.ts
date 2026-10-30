import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RoutesRecognized } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { DeviceGuard } from '@tamu-gisc/gisday/competitions/ngx/common';

import { publicRoutes } from './public.routes';

/**
 * Where the router sends an address in the competition app, before any guard runs. Both guards refuse
 * here, so nothing is loaded and only the route matching is under test.
 */
async function destinationOf(url: string): Promise<string> {
  const router = TestBed.inject(Router);
  let recognized = '';

  router.events.subscribe((event) => {
    if (event instanceof RoutesRecognized) {
      recognized = event.urlAfterRedirects;
    }
  });

  await router.navigateByUrl(url);

  return recognized;
}

describe('the competition app public routes', () => {
  beforeEach(() => {
    const refuse = { canActivate: () => false };

    TestBed.configureTestingModule({
      providers: [
        provideRouter(publicRoutes),
        { provide: DeviceGuard, useValue: refuse },
        { provide: AuthGuard, useValue: refuse }
      ]
    });
  });

  // The old login page signed in through the retired site login and could not even be created: nothing
  // provided the service it injected, so the page threw (#1608). GIS Day signs in through Auth0 only.
  it('sends /login to the submission page, which Auth0 guards, instead of the old login page', async () => {
    expect(await destinationOf('/login')).toBe('/submission');
  });

  it('guards every page that needs a signed-in user with Auth0', () => {
    const pages = publicRoutes[0].children ?? [];

    for (const path of ['map', 'submission', 'leaderboard']) {
      expect(pages.find((route) => route.path === path)?.canActivate).toContain(AuthGuard);
    }
  });

  // Students open the competition in their phone's browser; it no longer has to be installed or added
  // to the home screen first (#2559). The install page stays, as a suggestion.
  it('opens the map, the submission form and the leaderboard in a browser, without sending anyone to install', () => {
    const pages = publicRoutes[0].children ?? [];

    for (const path of ['map', 'submission', 'leaderboard']) {
      const route = pages.find((r) => r.path === path);

      expect(route?.canActivate).not.toContain(DeviceGuard);
      expect(route?.data?.['deviceFailRedirect']).toBeUndefined();
    }

    expect(pages.find((r) => r.path === 'install')).toBeDefined();
  });
});
