import * as fs from 'fs';

import { expect, test } from './fixtures';
import { MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';

/**
 * A satellite campus map loads only its own campus (#1910).
 *
 * Galveston, McAllen and DC / Bush School are built on the event framework, which loads the main
 * map's layers as well as a map's own. So each also loaded every College Station layer: 26 on DC,
 * among them Buildings, parking, bus routes, bike lanes and RNS Spaces with all 44,980 parking-space
 * points. About ten failed to load there and logged 40 console errors, and none could show anything on
 * another campus. On ArcGIS 5.1 the RNS Spaces load left the DC map painting for about 100 seconds,
 * which is how it was found: `popup.spec.ts`'s DC test failed every time on dev.
 *
 * Every layer loaded or failed as an ordinary layer does, so `maps.spec.ts` passed these maps. This
 * asks the question directly: is anything on the map that is not the basemap or this campus's own?
 *
 * A campus's own layers are named after it (`galveston-buildings-layer`, `dc-bush-school-property-layer`),
 * so the map's id from its route says which they are, and a campus added later is checked unchanged.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Probe layer types a basemap is made of. ArcGIS's own basemap layers carry no campus prefix. */
const BASEMAP_TYPES = ['tile', 'vector-tile'];

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/** The satellite campus maps this environment lists. */
const campusMaps = manifest.maps.filter((mapPath) => mapPath.startsWith('/campus/'));

interface ProbeLayer {
  id: string;
  type: string;
}

test.describe('satellite campus layers', () => {
  test('the environment lists some campus maps to check', () => {
    // Without this, a discovery change that stops listing them would empty this file and still pass.
    expect(campusMaps.length, 'no /campus/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const mapPath of campusMaps) {
    test(`${mapPath} loads none of College Station's layers`, async ({ page }) => {
      const campusId = mapPath.split('/').pop() as string;

      await blockAnalytics(page);
      await page.goto(mapPath, { waitUntil: 'domcontentloaded' });

      let layers: ProbeLayer[] = [];

      // `ready` once every layer has settled, so the list is the whole map, not its first few layers.
      await expect
        .poll(
          async () => {
            const snapshot = await page.evaluate(async (name) => {
              const probe = (
                window as unknown as Record<string, { ready?: boolean; snapshot: () => Promise<{ layers: ProbeLayer[] }> }>
              )[name];

              return probe?.ready === true ? (await probe.snapshot()).layers : null;
            }, PROBE_GLOBAL);

            layers = snapshot ?? [];

            return snapshot !== null && layers.some((layer) => layer.id.startsWith(`${campusId}-`));
          },
          { message: `${mapPath} never finished loading its own layers`, timeout: 90_000, intervals: [1_000] }
        )
        .toBe(true);

      const foreign = layers
        .filter((layer) => !BASEMAP_TYPES.includes(layer.type) && !layer.id.startsWith(`${campusId}-`))
        .map((layer) => layer.id);

      test.info().annotations.push({ type: 'layers', description: layers.map((layer) => layer.id).join(', ') });

      expect(foreign, `${mapPath} also loads layers that are not its own campus's`).toEqual([]);
    });
  }
});
