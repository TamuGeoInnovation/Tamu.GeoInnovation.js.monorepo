import { expect, test } from '@playwright/test';

import { GUARDED_ROUTES } from './routes';

/**
 * Guarded routes must not be reachable without authentication.
 *
 * This is the one behaviour in the public site where a regression is a security problem rather than
 * a cosmetic one, so it is covered before anything else.
 */
for (const route of GUARDED_ROUTES) {
  test(`${route.name} (${route.path}) redirects an unauthenticated visitor`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });

    // The guard may redirect to the forbidden page or bounce to the identity provider. Either is
    // acceptable; landing on the guarded page itself is not.
    await page.waitForURL((url) => !url.pathname.startsWith(route.path), { timeout: 15_000 });

    expect(new URL(page.url()).pathname).not.toBe(route.path);
  });
}
