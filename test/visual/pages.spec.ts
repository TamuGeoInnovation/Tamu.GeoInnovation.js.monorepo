import { expect, Page, test } from '@playwright/test';

/**
 * Visual baselines for the pages people land on. See #1067.
 *
 * Each page is captured at both viewports, because this codebase renders them genuinely differently:
 * a CSS mixin swaps the breadcrumb trail for a "< Back" link below 768px. The desktop rendering is
 * the one that went unnoticed in #1066, so capturing only one width would have missed it.
 *
 * What this catches that the smoke suite does not: the duplicated 150th Anniversary tile (#1055) —
 * two identical tiles side by side, which every layer check passed happily because nothing had failed
 * to load. A picture makes it obvious; a diff of the template does not, because each copy is
 * individually correct.
 */

/** Nx prefix for this workspace, so the root element is not the CLI default `app-root`. */
const APP_ROOT = 'tamu-gisc-aggiemap-app-root';

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/**
 * Content that changes without anyone touching the code, and would otherwise fail every run.
 *
 * Masked rather than excluded, so the space it occupies is still compared — if the events list moved
 * or changed size, that is a layout change worth seeing, even though its text is not.
 */
const VOLATILE = ['.upcoming-events', '[class*="upcoming"]', '[class*="event-date"]'];

/** Waits for the page to render, and for any map on it to finish drawing. */
async function settle(page: Page, { hasMap = false }: { hasMap?: boolean } = {}): Promise<void> {
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();

  if (!hasMap) {
    // Fonts and images, not a map. Without this the first capture can catch unstyled text.
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(1_500);

    return;
  }

  // Layers first, then paint. These are different moments: layers settle around six seconds in and
  // the view finishes drawing around twenty, so capturing at the first records a half-drawn map.
  await page
    .waitForFunction((name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true, PROBE_GLOBAL, {
      timeout: 90_000,
      polling: 1_000
    })
    .catch(() => undefined);

  await page
    .waitForFunction((name) => (window as unknown as Record<string, { drawing?: boolean }>)[name]?.drawing === false, PROBE_GLOBAL, {
      timeout: 90_000,
      polling: 1_000
    })
    .catch(() => undefined);

  // The view reports itself done a moment before the last tiles settle visually.
  await page.waitForTimeout(2_000);
}

function masks(page: Page) {
  return VOLATILE.map((selector) => page.locator(selector));
}

const PAGES = [
  { name: 'all-maps', path: '/all-maps', hasMap: false },
  { name: 'anniversary', path: '/all-maps/150', hasMap: false },
  { name: 'parking-maps', path: '/all-maps/parking', hasMap: false }
];

for (const { name, path, hasMap } of PAGES) {
  test(`${name} looks right`, async ({ page }, testInfo) => {
    await page.goto(path);
    await settle(page, { hasMap });

    await expect(page).toHaveScreenshot(`${name}-${testInfo.project.name}.png`, {
      fullPage: true,
      mask: masks(page)
    });
  });
}

/**
 * The main map, captured once drawing has finished.
 *
 * Held to a looser tolerance than the pages above, deliberately. The basemap and the operational data
 * change without anyone touching the code, so a strict threshold here would fail for reasons that are
 * not regressions. What this is watching for is a layer vanishing or the chrome moving, not a handful
 * of pixels.
 *
 * `fullPage` is off: the map fills the viewport, and a full-page capture of it adds nothing but
 * variability.
 */
test('the main map looks right', async ({ page }, testInfo) => {
  await page.goto('/map');
  await settle(page, { hasMap: true });

  await expect(page).toHaveScreenshot(`main-map-${testInfo.project.name}.png`, {
    mask: masks(page),
    maxDiffPixelRatio: 0.05
  });
});
