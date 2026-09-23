import { expect, test } from '@playwright/test';

import { APP_ROOT, PUBLIC_ROUTES } from './routes';

/**
 * Every public route must load without a server error and without the app throwing.
 *
 * These assertions are deliberately structural rather than content-based. A route that renders an
 * empty shell because an API call failed still fails here -- the app throws or nothing paints --
 * without the suite needing to know what copy is on the page. Content assertions belong in per-page
 * specs, added as each page is covered.
 */
for (const route of PUBLIC_ROUTES) {
  test(`${route.name} (${route.path}) loads`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });

    expect(response, `no response for ${route.path}`).not.toBeNull();
    expect(response?.status(), `${route.path} returned ${response?.status()}`).toBeLessThan(400);

    // Angular has bootstrapped.
    await expect(page.locator(APP_ROOT)).toBeAttached();

    // Wait for the app to actually paint. `domcontentloaded` fires long before Angular has
    // bootstrapped, resolved the lazy route module and rendered, so a one-shot `innerText()` read
    // races the framework -- which is exactly how /sessions and /competitions reported an empty
    // body on a page that renders fine. `expect.poll` retries until it settles.
    await expect
      .poll(async () => (await page.locator('body').innerText()).trim().length, {
        timeout: 15_000,
        message: `${route.path} never rendered any content`,
      })
      .toBeGreaterThan(0);

    // Routing has rendered, not just the shell. There are legitimately several outlets on a page
    // (root, wrapper, and any feature-level outlet), so this must not be a strict locator.
    await expect(page.locator('router-outlet').first()).toBeAttached();

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
