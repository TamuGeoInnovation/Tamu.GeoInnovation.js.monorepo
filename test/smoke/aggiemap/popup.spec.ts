import { expect, Page, test } from '@playwright/test';

import { blockAnalytics } from './analytics';

/**
 * Clicking a feature on a map opens its popup, and the popup shows that feature's data (#1117).
 *
 * The rest of the smoke suite checks that layers load and return features. That cannot notice a
 * map where clicking does nothing. On the satellite-campus maps the buildings are drawn by a
 * vector-tile basemap, which `view.hitTest()` cannot reach, so a nearly transparent feature layer
 * sits on top purely so that a click opens a popup (see `dc-bush-school.definitions.ts`). If that
 * overlay's service, fields or popup change, as its service did in #1110, clicks silently stop
 * working while every layer still loads.
 *
 * Read-only, and needs no screenshots, so it runs against any environment and on the schedule.
 *
 * Add a map by adding a row, not code.
 */

interface PopupCase {
  /** Map to open. */
  mapPath: string;
  /**
   * Where to click, as fractions of the map view's width and height. `{ x: 0.5, y: 0.5 }` is the
   * view's centre, which is the map's configured centre before anything pans it.
   */
  clickAt: { x: number; y: number };
  /** What the click should hit, for failure messages. */
  feature: string;
  /** Text the popup must contain, proving it shows that feature's data. */
  popupShows: RegExp;
}

const POPUP_CASES: PopupCase[] = [
  // The map is centred on the building, so the view's centre is on it.
  {
    mapPath: '/campus/dc-bush-school',
    clickAt: { x: 0.5, y: 0.5 },
    feature: 'the Bush School building',
    popupShows: /Bush School - DC/
  }
];

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Opens a map and waits until its layers have loaded and it has finished drawing. */
async function openMap(page: Page, mapPath: string): Promise<void> {
  await blockAnalytics(page);
  await page.goto(mapPath);

  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message: `the map on ${mapPath} never finished loading`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);

  // A click before the view has drawn can land on nothing, which would read as a broken popup.
  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { drawing?: boolean }>)[name]?.drawing === false,
          PROBE_GLOBAL
        ),
      { message: `the map on ${mapPath} never finished drawing`, timeout: 60_000, intervals: [1_000] }
    )
    .toBe(true);
}

test.describe('popup', () => {
  for (const { mapPath, clickAt, feature, popupShows } of POPUP_CASES) {
    test(`${mapPath}: clicking ${feature} opens its popup with data`, async ({ page }) => {
      await openMap(page, mapPath);

      const view = page.locator('.esri-view-surface').first();
      const box = await view.boundingBox();

      expect(box, `${mapPath} has no map view to click`).not.toBeNull();

      await page.mouse.click(box!.x + box!.width * clickAt.x, box!.y + box!.height * clickAt.y);

      const popup = page.locator('tamu-gisc-feature-popup .popup');

      await expect(popup, `clicking ${feature} on ${mapPath} did not open a popup`).not.toHaveClass(/hidden/, {
        timeout: 15_000
      });
      await expect(popup, `the popup for ${feature} on ${mapPath} did not show its data`).toContainText(popupShows);
    });
  }
});
