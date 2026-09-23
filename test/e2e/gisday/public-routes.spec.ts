import { expect, test } from '@playwright/test';

import { APP_ROOT, PUBLIC_ROUTES } from './routes';

/**
 * Every public route must load without a server error and without the app throwing.
 *
 * These assertions are deliberately structural rather than content-based. A route that renders an
 * empty shell because an API call failed still fails here -- the app throws or the outlet stays
 * empty -- without the suite needing to know what copy is on the page. Content assertions belong in
 * per-page specs, added as each page is covered.
 */
for (const route of PUBLIC_ROUTES) {
  test(`${route.name} (${route.path}) loads`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });

    expect(response, `no response for ${route.path}`).not.toBeNull();
    expect(response?.status(), `${route.path} returned ${response?.status()}`).toBeLessThan(400);

    // Angular has bootstrapped and routed rather than leaving the shell empty.
    await expect(page.locator(APP_ROOT)).toBeAttached();
    await expect(page.locator('router-outlet')).toBeAttached();

    // Something was actually rendered. Guards against a route that resolves but paints nothing.
    const text = await page.locator('body').innerText();
    expect(text.trim().length, `${route.path} rendered an empty body`).toBeGreaterThan(0);

    expect(pageErrors, `${route.path} threw: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
  });
}

test('an unknown route does not hang or 500', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });

  // A SPA serves index.html for unknown paths and handles the 404 client-side, so the useful
  // assertion is that the server did not error and the app still rendered something.
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator(APP_ROOT)).toBeAttached();
});
