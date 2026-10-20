import { expect, test } from '@playwright/test';

import { APP_ROOT, PUBLIC_ROUTES } from './routes';

/**
 * The site at phone width (#1980).
 *
 * A page wider than the screen scrolls sideways on a phone, and nothing else in the suite runs at that
 * width. 360 px is the narrowest common phone. The pages listed beyond the public routes are the ones
 * found broken on 20 October 2026, so each is checked by name.
 */
const PHONE = { width: 360, height: 780 };

const PAGES = [
  ...PUBLIC_ROUTES.map((route) => route.path),
  '/sponsors/tamu',
  '/sponsors/payment',
  '/competitions/presentation',
  '/competitions/posters',
  '/competitions/signage'
];

test.use({ viewport: PHONE, isMobile: true, hasTouch: true });

for (const path of PAGES) {
  test(`${path} is no wider than a phone`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(APP_ROOT)).toBeAttached();
    // As public-routes.spec.ts: wait for the page to paint, then for its data to arrive and lay out.
    await expect.poll(async () => (await page.locator('body').innerText()).trim().length, { timeout: 15_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2000);

    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, `${path} is ${width} px wide on a ${PHONE.width} px screen`).toBeLessThanOrEqual(PHONE.width);
  });
}

test('the Presentation page puts its text below the section links, not beside them', async ({ page }) => {
  await page.goto('/competitions/presentation', { waitUntil: 'domcontentloaded' });

  const text = page.locator('.column8').first();
  await expect(text).toBeVisible({ timeout: 15_000 });

  // Beside the links, the text had about half the screen.
  const box = await text.boundingBox();
  expect(box?.width ?? 0, 'the text column is squeezed beside the section links').toBeGreaterThan(PHONE.width * 0.7);
});

test('each sponsor level lists its benefits in one column', async ({ page }) => {
  await page.goto('/sponsors/tamu', { waitUntil: 'domcontentloaded' });

  const categories = page.locator('.content-block.visible .category');
  await expect(categories.first()).toBeVisible({ timeout: 15_000 });

  const lefts = await categories.evaluateAll((elements) => elements.map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(new Set(lefts).size, `benefit groups start at ${JSON.stringify(lefts)}: more than one column`).toBe(1);
});

test('the menu button has a background, so page text does not show through it', async ({ page }) => {
  await page.goto('/faq', { waitUntil: 'domcontentloaded' });

  const button = page.locator('tamu-gisc-hamburger-trigger');
  await expect(button).toBeVisible({ timeout: 15_000 });

  const background = await button.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(background, 'the menu button is transparent').not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
});
