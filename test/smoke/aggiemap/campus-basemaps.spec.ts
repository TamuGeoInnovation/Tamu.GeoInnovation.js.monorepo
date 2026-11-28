import * as fs from 'fs';

import { expect, test } from './fixtures';
import { MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { waitForMapReady } from './map-probe';

/**
 * Every satellite campus map can change its basemap, and is offered only basemaps that draw there (#1250).
 *
 * The campus maps' side panel showed only the Features tab, so a visitor at Galveston, McAllen or the Bush School could
 * not change the basemap at all; every other map has the gear. A gear alone would have been worse: the gallery always
 * offered College Station's own basemaps too, the Aggieland campus tiles and Nearmap's College Station imagery, which
 * draw nothing anywhere else (#1910 is the precedent: the DC map once loaded 26 College Station layers). So a campus map
 * offers the world basemaps only.
 *
 * The maps are the `/campus/` maps the suite discovered, as `campus-layers.spec.ts` takes them.
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const campusMaps = manifest.maps.filter((mapPath) => mapPath.startsWith('/campus/'));

/** The world basemaps the gallery offers on every map. */
const WORLD = ['Topographic', 'Light Gray Canvas'];

/** College Station's own basemaps, which draw nothing on another campus. */
const COLLEGE_STATION_ONLY = ['Aggieland', 'Aerial Imagery'];

test.describe('a satellite campus map can change its basemap (#1250)', () => {
  test('the campus maps were discovered', () => {
    expect(campusMaps.length, 'no /campus/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const mapPath of campusMaps) {
    test(`${mapPath} offers the world basemaps, and not College Station's`, async ({ page }) => {
      test.setTimeout(150_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      await blockAnalytics(page);
      await page.goto(mapPath);
      await waitForMapReady(page, `the map at ${mapPath} never finished loading`);

      const settings = page.locator('tamu-gisc-sidebar-tab [title="Settings"]');

      await expect(settings, `${mapPath} has no Settings tab, so its basemap cannot be changed`).toBeVisible({
        timeout: 30_000
      });
      await settings.click();

      const gallery = page.locator('tamu-gisc-basemap-gallery');

      for (const title of WORLD) {
        await expect(gallery, `${mapPath}'s gallery does not offer ${title}`).toContainText(title, { timeout: 30_000 });
      }

      for (const title of COLLEGE_STATION_ONLY) {
        await expect(gallery, `${mapPath}'s gallery offers ${title}, which draws nothing there`).not.toContainText(title);
      }
    });
  }
});
