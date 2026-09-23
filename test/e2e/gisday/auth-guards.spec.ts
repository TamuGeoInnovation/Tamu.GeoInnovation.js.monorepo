import { expect, test } from '@playwright/test';

import { GUARDED_ROUTES } from './routes';

/**
 * Guarded routes must not be reachable without authentication.
 *
 * This is the one behaviour in the public site where a regression is a security problem rather than
 * a cosmetic one, so it is covered before anything else.
 *
 * A note on what this can and cannot check. `common.config.ts` carries Auth0 settings as build-time
 * placeholders (`___ANGULAR_AUTH0_DOMAIN___`) that are substituted at deploy. A locally served
 * build therefore hands off to the literal string as a hostname, and that navigation dies with
 * ERR_NAME_NOT_RESOLVED. The hand-off attempt is still proof the guard fired, so this spec asserts
 * that the visitor did not remain on the guarded route -- whether the app redirected internally to
 * /forbidden or bounced toward an identity provider it cannot reach.
 *
 * Testing the far side of that redirect -- an actually authenticated session -- needs real or
 * mocked Auth0 configuration and is deliberately out of scope here.
 */
for (const route of GUARDED_ROUTES) {
  test(`${route.name} (${route.path}) does not serve an unauthenticated visitor`, async ({ page, baseURL }) => {
    const navigations: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
      }
    });

    // The Auth0 hand-off fails to resolve locally, so the navigation itself may reject. That is an
    // expected outcome here, not a test failure.
    await page.goto(route.path, { waitUntil: 'domcontentloaded' }).catch(() => undefined);

    const appHost = new URL(baseURL ?? 'http://localhost:4200').host;

    const stillOnGuardedRoute = () => {
      try {
        const current = new URL(page.url());
        return current.host === appHost && current.pathname.startsWith(route.path);
      } catch {
        // A failed navigation can leave an unparseable URL. That is not "still on the route".
        return false;
      }
    };

    await expect
      .poll(stillOnGuardedRoute, {
        timeout: 15_000,
        message:
          `${route.path} was still being served to an unauthenticated visitor. ` +
          `Navigations seen: ${navigations.join(' -> ') || '(none)'}`,
      })
      .toBe(false);
  });
}
