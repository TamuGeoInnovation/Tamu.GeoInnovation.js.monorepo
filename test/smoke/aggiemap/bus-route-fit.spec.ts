import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { BUS_PANEL, BUS_ROUTE } from './global-setup';
import { waitForMapReady } from './map-probe';

/**
 * Choosing a bus route fits the map to the route clear of the side panel (#2763).
 *
 * The map runs the full width of the page and the side panel lies over its right side, but the fit used the whole view.
 * So a long route's far end finished under the panel: route 47, which reaches RELLIS, ended 109 pixels behind it at
 * 1280 wide and 347 at 1600, measured on dev on 26 November 2026. The line was drawn correctly; it was the framing that
 * hid part of it, on the one thing a visitor does on this map.
 *
 * At two widths, because the panel is the same width at both and covers a different share of the map. The line's own
 * vertices are measured with `view.toScreen`, not its extent, whose corners can be empty map.
 */

/** The route the issue measured: the longest, from campus out to RELLIS. */
const ROUTE = '47';

/** Page widths to choose it at: the issue's, and a wider one where the fit zooms in further. */
const WIDTHS = [1280, 1600];

/** Where the chosen route's line lies on the page, and the side panel's left edge. */
interface Placement {
  line: { left: number; right: number };
  panelLeft: number;
}

/** Chooses `ROUTE` in the bus panel and waits until its line is drawn and the map has stopped moving. */
async function chooseRoute(page: Page): Promise<void> {
  await blockAnalytics(page);
  await page.goto(BUS_PANEL);
  await waitForMapReady(page, `the map at ${BUS_PANEL} never finished loading`);

  const route = page.locator(BUS_ROUTE, {
    has: page.locator('.route-number', { hasText: new RegExp(`^\\s*${ROUTE}\\s*$`) })
  });
  await expect(route, `route ${ROUTE} is not listed`).toHaveCount(1, { timeout: 60_000 });
  await route.locator('.route-overview').click();

  await expect
    .poll(async () => await page.evaluate(drawnAndStill), {
      message: `choosing route ${ROUTE} did not draw it and fit the map to it`,
      timeout: 60_000
    })
    .toBe(true);

  // The fit animates; still for two readings a second apart is finished, not between two steps.
  await page.waitForTimeout(1_000);
  await expect.poll(async () => await page.evaluate(drawnAndStill), { timeout: 30_000 }).toBe(true);

  function drawnAndStill(): boolean {
    const view = (document.querySelector('arcgis-map') as unknown as { view: EsriView }).view;
    const layer = view.map.findLayerById('bus-route-layer');

    return view.stationary && (layer?.graphics.toArray().some((g) => g.attributes?.type === 'route') ?? false);
  }
}

/** The route's line on the page, from its vertices, and the side panel's left edge. */
async function placement(page: Page): Promise<Placement> {
  return await page.evaluate(() => {
    const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: EsriView };
    const view = element.view;
    const box = element.getBoundingClientRect();
    const route = view.map
      .findLayerById('bus-route-layer')
      ?.graphics.toArray()
      .find((g) => g.attributes?.type === 'route');
    const panel = (document.querySelector('tamu-gisc-sidebar') as HTMLElement).getBoundingClientRect();
    const xs: number[] = [];

    for (const path of route?.geometry.paths ?? []) {
      for (const [x, y] of path) {
        const screen = view.toScreen({ type: 'point', x, y, spatialReference: route?.geometry.spatialReference });

        if (screen) {
          xs.push(box.left + screen.x);
        }
      }
    }

    return { line: { left: Math.min(...xs), right: Math.max(...xs) }, panelLeft: panel.left };
  });
}

test.describe(`choosing a bus route fits it clear of the side panel (#2763)`, () => {
  for (const width of WIDTHS) {
    test(`route ${ROUTE} at ${width} pixels wide`, async ({ page }) => {
      test.setTimeout(150_000);
      await page.setViewportSize({ width, height: 900 });

      await chooseRoute(page);
      const { line, panelLeft } = await placement(page);

      expect(Number.isFinite(line.right), `route ${ROUTE}'s line has no vertex on the page`).toBe(true);
      expect(
        line.right,
        `route ${ROUTE}'s line reaches x ${Math.round(line.right)}, ${Math.round(line.right - panelLeft)} pixels behind the side panel at x ${Math.round(panelLeft)}`
      ).toBeLessThanOrEqual(panelLeft);
      expect(line.left, `route ${ROUTE}'s line starts off the left of the map`).toBeGreaterThanOrEqual(0);
    });
  }
});

/** The little of Esri's types this spec uses; the suite does not load them. */
interface EsriGraphic {
  attributes?: { type?: string };
  geometry: { paths: number[][][]; spatialReference: object };
}

interface EsriView {
  stationary: boolean;
  map: { findLayerById(id: string): { graphics: { toArray(): EsriGraphic[] } } | undefined };
  toScreen(point: object): { x: number; y: number } | null;
}
