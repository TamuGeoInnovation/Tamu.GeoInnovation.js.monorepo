import { expect, test } from '@playwright/test';

/** Nx prefix for this workspace is `tamu-gisc`, so the root element is not the CLI default `app-root`. */
const APP_ROOT = 'tamu-gisc-root';

/**
 * Smoke checks against a deployed GIS Day environment.
 *
 * Read-only and deliberately minimal: enough to distinguish "the site is serving" from "the site is
 * down or serving an empty shell", and nothing that could mutate state. A failure here means the
 * deployment is unhealthy, not that a commit is bad, which is why this cannot gate a PR.
 *
 * Target with SMOKE_BASE_URL; defaults to https://txgisday.org.
 */
test('the landing page serves', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.status()).toBe(200);
  await expect(page.locator(APP_ROOT)).toBeAttached();
  expect((await page.locator('body').innerText()).trim().length).toBeGreaterThan(0);
});

test('the sessions page serves and renders', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  const response = await page.goto('/sessions', { waitUntil: 'domcontentloaded' });

  expect(response?.status()).toBe(200);
  await expect(page.locator(APP_ROOT)).toBeAttached();
  expect(pageErrors.map((e) => e.message)).toHaveLength(0);
});

test('no request on the landing page fails with a server error', async ({ page }) => {
  const serverErrors: string[] = [];

  page.on('response', (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(serverErrors, `server errors: ${serverErrors.join(', ')}`).toHaveLength(0);
});
