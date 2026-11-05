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
 *
 * ---
 *
 * Every assertion about rendered content has to auto-retry, because this is a client-rendered
 * Angular app. Two traps, both of which this file previously fell into and which reported a healthy
 * site as down every six hours:
 *
 * 1. `waitUntil: 'domcontentloaded'` resolves when the HTML has parsed, which is *before* Angular
 *    bootstraps. There is no rendered content at that point.
 * 2. `<tamu-gisc-root>` ships in `index.html`, so `toBeAttached()` passes immediately -- while the
 *    element is still empty. It proves the shell was served, not that the app started.
 *
 * So: assert on content inside the root, and only through `expect()` matchers, which poll until
 * the timeout. A bare `await locator.innerText()` is a single sample and will read an empty body.
 */
test('the landing page serves', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);

  // Polls until Angular has rendered into the root, rather than sampling once.
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();
});

test('the sessions page serves and renders', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  const response = await page.goto('/sessions');

  expect(response?.status()).toBe(200);
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();

  // Checked after the render assertion above, so a bootstrap failure is reported as an empty app
  // rather than as an incidental console error.
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

/**
 * #2649. Link previews (Tradewing, LinkedIn, Facebook, Slack) read the HTML a site serves and never run the app, so the
 * page itself has to name the site it is reached at. Every site once served txgisday.org's page, so a UCGIS post about
 * gisday.ucgis.org showed "TxGIS Day" with no image. Read as a preview service reads it: the raw HTML, no browser.
 */
const SITE_NAMES: Record<string, string> = {
  'txgisday.org': 'TxGIS Day',
  'gisday.tamu.edu': 'Texas A&M GIS Day',
  'gisday.ucgis.org': 'UCGIS GIS Day'
};

test('the page a link preview reads names this site and has its image', async ({ request, baseURL }) => {
  const host = new URL(baseURL ?? 'https://txgisday.org').hostname;
  const response = await request.get('/');
  const html = await response.text();
  const meta = (property: string) =>
    html.match(new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`))?.[1]?.replace(/&amp;/g, '&');

  expect(response.status()).toBe(200);

  if (SITE_NAMES[host]) {
    expect(meta('og:title'), `og:title on ${host}`).toBe(SITE_NAMES[host]);
    expect(meta('og:site_name'), `og:site_name on ${host}`).toBe(SITE_NAMES[host]);
  }

  const image = meta('og:image');
  expect(image, `og:image on ${host}`).toBeTruthy();

  const picture = await request.get(image as string);
  expect(picture.status(), `${image}`).toBe(200);
  expect(picture.headers()['content-type']).toContain('image/');
});
