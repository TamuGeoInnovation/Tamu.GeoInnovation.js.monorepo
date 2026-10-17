import { expect, Page, test } from '@playwright/test';

import { APP_ROOT } from './routes';

/**
 * The UCGIS site, gisday.ucgis.org (#1837): the same app as txgisday.org with `ANGULAR_SITE=ucgis`.
 *
 * The container replaces `___ANGULAR_SITE___` in the app's scripts when it starts. This does the same
 * to every script the dev server sends, so what runs here is what that deployment runs.
 */
async function asUcgis(page: Page) {
  await page.route(/\.js(\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/___ANGULAR_SITE___/g, 'ucgis');
    await route.fulfill({ response, body });
  });
}

async function open(page: Page, path: string) {
  await asUcgis(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator(APP_ROOT)).toBeAttached();
  await expect(page.locator('header nav')).toBeVisible({ timeout: 15_000 });
}

test('the UCGIS site has its own name, logo, banner and tab icon', async ({ page }) => {
  await open(page, '/');

  await expect(page).toHaveTitle('UCGIS GIS Day');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', 'assets/images/sites/ucgis/favicon.png');
  await expect(page.locator('#site-logo img')).toHaveAttribute('src', 'assets/images/sites/ucgis/logo.png');
  await expect(page.locator('#landing img').first()).toHaveAttribute('src', 'assets/images/sites/ucgis/banner.png');
  await expect(page.locator('#landing .site-logo')).toContainText('UCGIS GIS Day');
});

test('the UCGIS menus leave out what the site does not have', async ({ page }) => {
  await open(page, '/');

  const menu = page.locator('header nav');
  await expect(menu.getByRole('link', { name: 'Sessions', exact: true })).toBeVisible();
  for (const id of ['#linkSponsors', '#linkCompetitions', '#linkFAQ']) {
    await expect(page.locator(id), `${id} should not be in the header`).toHaveCount(0);
  }
  await expect(menu.getByText('Resume Bank')).toHaveCount(0);

  const footer = page.locator('footer');
  for (const name of ['Competitions', 'FAQ', 'Sponsors', 'My Classes', 'Open Records', 'Texas A&M University -']) {
    await expect(footer.getByRole('link', { name, exact: true }), `${name} should not be in the footer`).toHaveCount(0);
  }
  await expect(footer).toContainText('University Consortium for Geographic Information Science');
  await expect(footer.getByText('Past Years')).toHaveCount(0);

  await expect(page.getByRole('heading', { name: 'Event Sponsors' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Nominate a TX GIS Hero' })).toHaveCount(0);
});

test('the About page leaves out what only Texas A&M has', async ({ page }) => {
  await open(page, '/about');

  await expect(page.getByRole('heading', { name: 'About UCGIS GIS Day' })).toBeVisible();
  for (const name of ['Organizing Committee', 'Student Opportunities', 'GIS Resume Bank']) {
    await expect(page.getByRole('heading', { name }), `${name} should not be on the About page`).toHaveCount(0);
  }
  // The organizations listed can be anywhere, Texas included; the introduction is what was ours.
  await expect(page.locator('body')).not.toContainText('extra "spatial" this year in Texas');
});

// The profile's Classes and Check-ins are behind sign-in as well, so a visitor never reaches them.
for (const path of [
  '/faq',
  '/sponsors',
  '/competitions',
  '/competitions/vgi',
  '/app',
  '/seasons/2025/sessions',
  '/wayback'
]) {
  test(`${path} goes to the homepage on the UCGIS site`, async ({ page }) => {
    await open(page, path);
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 15_000 }).toBe('/');
  });
}
