import { Page } from '@playwright/test';

import { PHONE_VIEWPORT, expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { waitForMapDrawn, waitForMapReady } from './map-probe';

/**
 * A map opens with all of its own layer in view (#1501).
 *
 * A map's opening framing is a declared zoom and centre. Nothing checked them against what the map draws, so a map
 * could open with part of its point cut off: Soccer Parking's declared centre is Outdoor Track Parking's, about 250
 * metres south-west of its lots, and on production on 27 November 2026 its Lot 104 opened cut off by the top of the map.
 * `framing.spec.ts` compares a map's framing with production's, so it says where a map opens, not whether that is right.
 *
 * Each case names the layer a visitor opens the map to see. Its whole extent, as the layer answers it, must lie in the
 * part of the map nothing covers: beside the side panel on a desktop, and the whole map on a phone.
 */

const CASES = [{ path: '/parking/soccer-parking', layer: 'soccer-parking-lots' }];

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 }, isMobile: false },
  { name: 'phone', viewport: PHONE_VIEWPORT, isMobile: true }
];

/** Where the layer's extent lies on the page, and the part of the map nothing covers. */
interface Placement {
  extent: { left: number; right: number; top: number; bottom: number };
  clear: { left: number; right: number; top: number; bottom: number };
}

async function placement(page: Page, layerId: string): Promise<Placement | string> {
  return await page.evaluate(async (id) => {
    const element = document.querySelector('arcgis-map') as unknown as HTMLElement & {
      view: {
        map: { findLayerById(id: string): { queryExtent(): Promise<{ extent: object | null }> } | undefined };
        toScreen(point: object): { x: number; y: number } | null;
        spatialReference: object;
      };
    };
    const view = element.view;
    const layer = view.map.findLayerById(id);

    if (!layer) {
      return `the map has no layer ${id}`;
    }

    const { extent } = (await layer.queryExtent()) as {
      extent: { xmin: number; ymin: number; xmax: number; ymax: number; spatialReference: object } | null;
    };

    if (!extent) {
      return `${id} answered no extent`;
    }

    const box = element.getBoundingClientRect();
    const corner = (x: number, y: number) =>
      view.toScreen({ type: 'point', x, y, spatialReference: extent.spatialReference }) ?? { x: NaN, y: NaN };
    const topLeft = corner(extent.xmin, extent.ymax);
    const bottomRight = corner(extent.xmax, extent.ymin);

    // The side panel lies over the map's right side on a desktop; a panel slid away lies off the map.
    const panel = document.querySelector('tamu-gisc-sidebar')?.getBoundingClientRect();
    const right = panel && panel.left < box.right && panel.right > box.left ? Math.max(box.left, panel.left) : box.right;

    return {
      extent: {
        left: box.left + topLeft.x,
        top: box.top + topLeft.y,
        right: box.left + bottomRight.x,
        bottom: box.top + bottomRight.y
      },
      clear: { left: box.left, top: box.top, right, bottom: box.bottom }
    };
  }, layerId);
}

for (const { name, viewport, isMobile } of VIEWPORTS) {
  test.describe(`on a ${name}, a map opens with its own layer in view (#1501)`, () => {
    test.use({ viewport, isMobile, hasTouch: isMobile });

    for (const { path, layer } of CASES) {
      test(`${path} shows all of ${layer}`, async ({ page }) => {
        test.setTimeout(150_000);
        await blockAnalytics(page);
        await page.goto(path);
        await waitForMapReady(page, `the map at ${path} never finished loading`);
        await waitForMapDrawn(page, `the map at ${path} never finished drawing`, { timeout: 60_000 });

        const found = await placement(page, layer);

        expect(typeof found, String(found)).toBe('object');
        const { extent, clear } = found as Placement;
        const round = (n: number) => Math.round(n);

        expect(
          extent.left >= clear.left && extent.right <= clear.right && extent.top >= clear.top && extent.bottom <= clear.bottom,
          `${path} opens with ${layer} from x ${round(extent.left)} to ${round(extent.right)} and y ${round(extent.top)} ` +
            `to ${round(extent.bottom)}, but the clear map is x ${round(clear.left)} to ${round(clear.right)} and y ` +
            `${round(clear.top)} to ${round(clear.bottom)}`
        ).toBe(true);
      });
    }
  });
}
