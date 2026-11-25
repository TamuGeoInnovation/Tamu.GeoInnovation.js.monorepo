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

/**
 * #1836. A past year's Sessions page said "There are no organizations." under Organizations, although its sessions name
 * where they were held. Since #1826 the filter lists only the organizations ticked **Sessions Filter**, and no past
 * season's were. This asks the API for the most recent past season and where its sessions were held, then checks that
 * year's page offers at least one of those organizations, and only those. Read only.
 */
test("a past year's Sessions page offers the organizations its sessions were held at", async ({
  page,
  request,
  baseURL
}) => {
  const api = new URL('/api/', baseURL).toString();
  const seasons = (await (await request.get(`${api}seasons`)).json()) as Array<{
    guid: string;
    year: number;
    active: boolean;
  }>;
  const current = seasons.find((season) => season.active)?.year ?? Infinity;
  const past = seasons.filter((season) => season.year < current).sort((a, b) => b.year - a.year)[0];

  test.skip(!past, 'This site has no past season');

  const sessions = (await (await request.get(`${api}events/season/${past.guid}`)).json()) as Array<{
    location?: { place?: { name?: string } };
  }>;
  const hosts = new Set(sessions.map((session) => session.location?.place?.name).filter(Boolean));

  test.skip(hosts.size === 0, `No ${past.year} session names where it was held`);

  await page.goto(`/seasons/${past.year}/sessions`);

  const filter = page.locator('#organization-filters-container');
  const offered = filter.locator('tamu-gisc-checkbox');

  const empty = filter.getByText('There are no organizations.');

  // Whichever the filter settles on, once its organizations have loaded.
  await expect(offered.first().or(empty)).toBeVisible();
  await expect(empty, `${past.year}'s Organizations filter is empty`).toHaveCount(0);

  // The label alone: a checkbox's own text starts with its icon's ligature ("check_box_outline_blank"), which is no name.
  const names = (await offered.locator('label').allInnerTexts()).map((name) => name.trim());

  expect(
    names.filter((name) => !hosts.has(name)),
    `${past.year}: offered but held no session`
  ).toEqual([]);
});

/**
 * #3208. A session's Presenters cards were a fixed 350 px wide, so on a 360 px phone the session's page was 11 px wider
 * than the screen and scrolled sideways. The Sessions and Presenters pages open an entry by script, with no link to
 * follow, and neither list the API gives them names a session's speakers; a session's own details do. So this asks the
 * API for the active season's sessions, opens the first whose details list a speaker, and checks the page is no wider
 * than the phone. Read only.
 */
test.describe('on a 360 px phone', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("a session's page with presenters fits the screen", async ({ page, request, baseURL }) => {
    const api = new URL('/api/', baseURL).toString();
    const sessions = (await (await request.get(`${api}events/season/active`)).json()) as Array<{ guid: string }>;
    let withPresenters: string | undefined;

    for (const { guid } of sessions.slice(0, 30)) {
      const details = (await (await request.get(`${api}events/${guid}`)).json()) as { speakers?: Array<unknown> };

      if (details.speakers?.length) {
        withPresenters = guid;
        break;
      }
    }

    test.skip(!withPresenters, `None of the first ${Math.min(sessions.length, 30)} sessions has presenters`);

    const link = `/sessions/details/${withPresenters}`;

    await page.goto(link);
    await expect(page.locator('tamu-gisc-presenter-card').first()).toBeVisible();

    const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, screen: window.innerWidth }));

    expect(width.page, `${link}: the page is ${width.page} px wide on a ${width.screen} px screen`).toBeLessThanOrEqual(
      width.screen
    );
  });
});
