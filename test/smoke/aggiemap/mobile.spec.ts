import { Page } from '@playwright/test';
import * as fs from 'fs';

import { PHONE_VIEWPORT, expect, test } from './fixtures';
import { MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { developmentSectionsVisible } from './development-only';
import { ProbeLayer, waitForMapDrawn, waitForMapReady } from './map-probe';

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
const { width: MOBILE_WIDTH, height: MOBILE_HEIGHT } = PHONE_VIEWPORT;
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
  // The campus maps are listed on both environments since #1482, so production has one to find.
  // Kiosk maps are still listed in the development variant alone, deliberately - they are an
  // embedding target rather than something to offer a visitor - so production has no representative
  // of that class (see global-setup.ts, #1393).
  { name: 'a campus map', route: representative('/campus/') },
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

/**
 * On a phone, an event map's locate button heads the stack of map buttons, above Legend and Layers (#2642).
 *
 * In the map's bottom-right slot it sat on its own at the very bottom of the screen, over the tents and zones on the
 * Football Tailgating map, and a tap that missed it opened a feature's popup, which is hard to close on a phone. Read
 * from where the buttons are drawn: locate must be above Legend, in the same column, and must still be Esri's locate.
 */
test.describe('on a phone, an event map', () => {
  test.use({ viewport: { width: MOBILE_WIDTH, height: MOBILE_HEIGHT }, isMobile: true, hasTouch: true });

  test('stacks the locate button above Legend and Layers (/events/tailgating/map)', async ({ page }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);
    await page.goto('/events/tailgating/map', { waitUntil: 'domcontentloaded' });

    const locate = page.locator('arcgis-track');
    const legend = page.locator('[routerLink="./m/sidebar/legend"]');

    await expect(legend, 'the phone map shows no Legend button').toBeVisible({ timeout: 90_000 });
    await expect(locate, 'the phone map should have exactly one locate button').toHaveCount(1, { timeout: 30_000 });
    await expect(locate, 'the phone map shows no locate button').toBeVisible();

    const [l, g] = [await locate.boundingBox(), await legend.boundingBox()];

    if (!l || !g) {
      throw new Error('the locate or Legend button has no box on the page');
    }

    expect(l.y + l.height, 'the locate button should be above the Legend button').toBeLessThanOrEqual(g.y);
    expect(
      Math.abs(l.x + l.width / 2 - (g.x + g.width / 2)),
      'the locate button should be in the column of Legend'
    ).toBeLessThanOrEqual(4);
  });

  /**
   * The phone menu's Bus Routes and Directions keep the visitor on the event map (#2997).
   *
   * The phone menu is one component on every map, but its two items were absolute addresses, `/map/m/bus` and
   * `/map/m/trip`. So on the tailgating map, Bus Routes threw the visitor onto the main campus map's bus list, which the
   * event maps had no phone route for, and Directions onto the main map's trip planner. The desktop panel solved the same
   * drift with one shared route list (#2758); the phone has its own now, and the items are relative.
   */
  for (const item of [
    { name: 'Bus Routes', lands: '/m/bus', shows: 'tamu-gisc-bus-route' },
    { name: 'Directions', lands: '/m/trip', shows: 'tamu-gisc-trip-planner-bottom, tamu-gisc-trip-planner-top' }
  ]) {
    test(`keeps the visitor on the map when ${item.name} is chosen from its menu (#2997)`, async ({ page }) => {
      test.setTimeout(180_000);
      await blockAnalytics(page);
      await page.goto('/events/tailgating/map/m/sidebar', { waitUntil: 'domcontentloaded' });

      const link = page.getByRole('link', { name: item.name, exact: true });

      await expect(link, `the tailgating map's phone menu has no ${item.name}`).toBeVisible({ timeout: 90_000 });
      await link.click();

      await expect
        .poll(() => new URL(page.url()).pathname, { message: `${item.name} left the tailgating map`, timeout: 30_000 })
        .toBe(`/events/tailgating/map${item.lands}`);
      await expect(page.locator(item.shows).first(), `${item.name} on the tailgating map showed nothing`).toBeVisible({
        timeout: 60_000
      });
    });
  }
});

/** The layer the map draws a chosen feature into, and how many graphics it holds. */
const SELECTION_LAYER_ID = 'selection-layer';

function selected(layers: ProbeLayer[]): number {
  const selection = layers.find((l) => l.id === SELECTION_LAYER_ID);

  return Object.values(selection?.graphicTypes ?? {}).reduce((sum, count) => sum + count, 0);
}

/**
 * On a phone, a selection can be cleared: the search box offers a clear control, and using it leaves no selection on
 * the map and nothing in the box (#3655, for #71).
 *
 * #71 has been open since August 2020 and was confirmed on 25 November 2026: the phone's search box never shows its
 * right-hand (clear) action, because the omnisearch does not give it one, and the phone's popup has no close control,
 * so nothing on a phone clears a selection. Until #71 is fixed this is an expected failure. Everything up to the
 * selection is asserted first, so the test is marked as failing only once it has reached what #71 is about; a search
 * that never answered fails it for real. Playwright fails an expected failure that passes, so the day #71 is fixed the
 * suite says so, and that pull request removes the mark.
 */
test.describe('on a phone, the main map', () => {
  test.use({ viewport: { width: MOBILE_WIDTH, height: MOBILE_HEIGHT }, isMobile: true, hasTouch: true });

  test('clears a chosen search result from the search box (#71)', async ({ page }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);
    await page.goto('/map/m', { waitUntil: 'domcontentloaded' });

    const input = page.getByPlaceholder('Tap to begin searching');

    await expect(input, 'the phone map shows no search box').toBeVisible({ timeout: 90_000 });
    await input.click();
    await input.pressSequentially('Wehner', { delay: 80 });

    const option = page.locator('.search-results-container').getByRole('option', { name: /^Wehner Building \(1510\)$/i });

    await expect(option, 'searching "Wehner" on the phone did not list the Wehner Building').toBeVisible({
      timeout: 20_000
    });
    await option.dispatchEvent('mousedown');

    await waitForMapDrawn(page, 'choosing the Wehner Building on the phone selected nothing', {
      until: (layers) => selected(layers) > 0
    });
    await expect(input, 'the search box should name the chosen building').not.toHaveValue('');

    // Everything above is the set-up, and has to work. What follows is #71.
    test.fail(true, '#71: the phone search box offers no way to clear a selection');

    const clear = page.locator('tamu-gisc-search-mobile .action-icons.right');

    await expect(clear, 'the phone search box offers no clear control').toBeVisible({ timeout: 10_000 });
    await clear.dispatchEvent('mousedown');

    await expect(input, 'clearing left text in the search box').toHaveValue('', { timeout: 10_000 });
    await waitForMapDrawn(page, 'clearing left the building selected on the map', {
      timeout: 15_000,
      until: (layers) => selected(layers) === 0
    });
  });
});

/**
 * On a short phone screen, the end of the sidebar's layer list can be reached, and the sidebar still closes (#3656,
 * for #387).
 *
 * The height is what matters, not the width: at 375 by 812 the list fits. The panel is `height: 100vh` with no
 * `overflow-y`, so it does not scroll itself; measured on dev on 25 November 2026, the page scrolls instead (95 px at
 * 375 by 380), which brings the end of the list into view, and the sidebar then still closes. So in Chromium both
 * halves of #387 work today, and this asserts what a person needs from them: the end of the list can be reached, and
 * the sidebar can be closed afterwards. It does not prove a phone's browser does the same; #387 was reported on one.
 * Closing by tapping beside it is also checked on its own, so a change to the scrolling cannot hide a broken close.
 */
test.describe('on a short phone screen, the sidebar', () => {
  const SHORT = { width: MOBILE_WIDTH, height: 380 };

  /**
   * Where to tap beside the panel, and where to scroll over it: near the top. On a screen this short, notifications
   * (an event map's "Map Available", the development build's "View as production") cover the middle and bottom, and a
   * tap there closes a notification instead of reaching the sidebar.
   */
  const BESIDE = { x: SHORT.width - 20, y: 40 };
  const OVER_LIST = { x: SHORT.width * 0.35, y: 100 };

  test.use({ viewport: SHORT, isMobile: true, hasTouch: true });

  const openLayers = async (page: Page) => {
    await blockAnalytics(page);
    await page.goto('/map/m/sidebar/layers', { waitUntil: 'domcontentloaded' });

    const items = page.locator('tamu-gisc-mobile-sidebar tamu-gisc-layer-list-item');

    await expect(items.first(), 'the phone sidebar lists no layers').toBeVisible({ timeout: 90_000 });
    // As a person would: a tap in the first second, while the map is still starting, does not reach the sidebar.
    await waitForMapReady(page, 'the map behind the phone sidebar never finished loading');

    return items;
  };

  test('closes when tapped beside it', async ({ page }) => {
    test.setTimeout(150_000);
    await openLayers(page);

    // The backdrop fills the screen beside the panel, which is 75% of its width.
    await page.mouse.click(BESIDE.x, BESIDE.y);
    await expect(page, 'tapping beside the sidebar did not close it').not.toHaveURL(/\/sidebar/, { timeout: 15_000 });
  });

  test('brings the end of its layer list into view, and still closes (#387)', async ({ page }) => {
    test.setTimeout(150_000);

    const items = await openLayers(page);
    const last = items.last();
    const below = async () =>
      ((await last.boundingBox())?.y ?? 0) + ((await last.boundingBox())?.height ?? 0) - SHORT.height;

    // The set-up: on this screen the list must be longer than the screen, or there is nothing to scroll.
    expect(await below(), 'the layer list fits this screen, so it cannot show whether it scrolls').toBeGreaterThan(0);

    // A person scrolls the list with a finger over it; a wheel over the panel is the same request to the page.
    await page.mouse.move(OVER_LIST.x, OVER_LIST.y);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 200);
    }
    await page.waitForTimeout(1_000);

    expect(await below(), 'the last layer in the list is still below the screen after scrolling').toBeLessThanOrEqual(0);

    await page.mouse.click(BESIDE.x, BESIDE.y);
    await expect(page, 'after scrolling, tapping beside the sidebar did not close it').not.toHaveURL(/\/sidebar/, {
      timeout: 15_000
    });
  });
});
