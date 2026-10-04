import { expect, test, Page } from '@playwright/test';
import * as fs from 'fs';

import { MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { developmentSectionsVisible } from './development-only';

/**
 * Every class of page works at phone width (#1331).
 *
 * Nothing checked this. The smoke suite loads 69 maps at one width; the visual suite covers both
 * widths but only four pages. So 65 maps were never seen on a phone by anything, and three faults
 * found by eye in a fortnight - #1251, #1026, #1075 - were all width-dependent.
 *
 * **This is not only a CSS question.** `ResponsiveService` flips `isMobile` at `width <= 768`, and
 * `DesktopGuard` acts on it: `/map/d` is rewritten to `/map/m`, which renders *different components*.
 * A page checked only at desktop width has not been checked at all on a phone - it has had a
 * different half of the application exercised.
 *
 * Checks are by class of page rather than one per map, and assert behaviour rather than appearance:
 * a baseline image would have to be regenerated whenever a map's data changes, and would say nothing
 * about whether the page is usable.
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/** The width the application itself treats as the boundary - `ResponsiveService._checkWidth`. */
const MOBILE_WIDTH = 375;
const MOBILE_HEIGHT = 812;
const DESKTOP_WIDTH = 1280;

/**
 * One representative per class, not all 69.
 *
 * The classes render through different modules - the main map, an event map, a parking map, a
 * satellite campus map, a sidebar-free kiosk map, and the discover listings. Checking one of each
 * finds a broken class; checking all 69 would mostly re-ask the same question and double a run that
 * already takes half an hour.
 */
function representative(prefix: string): string | undefined {
  return manifest.maps.find((route) => route.startsWith(prefix));
}

const classes: { name: string; route: string | undefined; developmentOnly?: boolean }[] = [
  { name: 'the main map', route: '/map' },
  { name: 'an event map', route: representative('/events/') },
  { name: 'a parking map', route: representative('/parking/') },
  { name: 'an operations map', route: representative('/operations/') },
  // All Maps lists the satellite campus and kiosk sections only in the development variant, so
  // production has no representative of either to find (see global-setup.ts, #1393).
  { name: 'a campus map', route: representative('/campus/'), developmentOnly: true },
  { name: 'a kiosk map', route: representative('/kiosk/'), developmentOnly: true },
  { name: 'All Maps', route: '/all-maps' },
  { name: 'a discover listing', route: '/all-maps/parking' }
];

/** The classes this environment lists, from `developmentSectionsVisible` in environments.json. */
const expected = classes.filter((c) => developmentSectionsVisible() || !c.developmentOnly);

const covered = classes.filter((c): c is { name: string; route: string } => Boolean(c.route));

/** Horizontal overflow: content wider than the screen, which on a phone means something is cut off. */
async function overflow(page: Page): Promise<{ scrollWidth: number; clientWidth: number }> {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
}

test.describe('every class of page at phone width', () => {
  test.use({ viewport: { width: MOBILE_WIDTH, height: MOBILE_HEIGHT } });

  test('a representative of each class was found', () => {
    // Without this, a discovery change that stopped listing a whole class would empty those checks
    // and still report green.
    expect(covered.map((c) => c.name).sort(), 'some classes of page had no representative').toEqual(
      expected.map((c) => c.name).sort()
    );
  });

  for (const { name, route } of covered) {
    test(`${name} (${route}) does not overflow the screen`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8_000);

      const { scrollWidth, clientWidth } = await overflow(page);

      // A few pixels of rounding is not a fault; a control sitting off the side of the screen is.
      expect(
        scrollWidth - clientWidth,
        `${route} is ${scrollWidth - clientWidth}px wider than the screen at ${MOBILE_WIDTH}px, so something is cut off`
      ).toBeLessThanOrEqual(2);
    });

    test(`${name} (${route}) renders something at phone width`, async ({ page }) => {
      await blockAnalytics(page);

      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8_000);

      // The application root having no height is what a broken mobile layout looks like from here -
      // the page loads, Angular runs, and the visitor sees nothing.
      const height = await page.evaluate(() => document.body.getBoundingClientRect().height);

      expect(height, `${route} rendered a body with no height at phone width`).toBeGreaterThan(100);
      expect(errors, `${route} raised page errors at phone width: ${errors.join('; ')}`).toEqual([]);
    });
  }
});

/**
 * The route guards are the part a CSS check cannot see.
 *
 * `DesktopGuard` rewrites `d` to `m` below 769px and `MobileGuard` does the reverse, so the two
 * widths render different components. If a guard stops firing, a phone gets the desktop sidebar -
 * which is #1026 and #1251 in one.
 */
test.describe('the responsive route guards', () => {
  test('a phone is sent to the mobile route', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await blockAnalytics(page);
    await page.goto('/map/d', { waitUntil: 'domcontentloaded' });

    await expect(page, 'a phone asking for /map/d should be rewritten to /map/m').toHaveURL(/\/map\/m/, {
      timeout: 30_000
    });
  });

  test('a desktop is sent to the desktop route', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: 900 });
    await blockAnalytics(page);
    await page.goto('/map/m', { waitUntil: 'domcontentloaded' });

    await expect(page, 'a desktop asking for /map/m should be rewritten to /map/d').toHaveURL(/\/map\/d/, {
      timeout: 30_000
    });
  });

  test('the boundary is where the application says it is', async ({ page }) => {
    // ResponsiveService._checkWidth treats `<= 768` as mobile. Pinning both sides of that line means
    // a change to the breakpoint has to be deliberate rather than accidental.
    await blockAnalytics(page);

    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/map/d', { waitUntil: 'domcontentloaded' });
    await expect(page, '768px should be treated as mobile').toHaveURL(/\/map\/m/, { timeout: 30_000 });

    await page.setViewportSize({ width: 769, height: 900 });
    await page.goto('/map/m', { waitUntil: 'domcontentloaded' });
    await expect(page, '769px should be treated as desktop').toHaveURL(/\/map\/d/, { timeout: 30_000 });
  });
});
