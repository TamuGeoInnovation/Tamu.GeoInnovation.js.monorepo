import { expect, test } from '@playwright/test';
import * as fs from 'fs';

import { APP_ROOT, MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { BLANK_ABOVE, waitForPaint } from './paint';

/**
 * A satellite campus map draws for a visitor who has chosen a basemap before (#1259).
 *
 * The campus maps carry their own vector tile basemap, in Web Mercator. They were also honouring
 * AggieMap's saved basemap preference, which on development resolves to the Aggieland vector tile
 * cache in EPSG:32139. The view takes its projection from the basemap, so the campus's own tiled
 * basemap could not be reprojected into it and vanished - leaving the buildings feature layer, which
 * Esri does reproject, drawing grey outlines on a white page.
 *
 * Every layer reported itself loaded, visible and drawable throughout, which is why `maps.spec.ts`
 * passed these maps while they were unusable.
 *
 * The preference is the point of this file. A fresh browser has none, takes a different branch, and
 * draws correctly - so the rest of the suite cannot see this fault at all.
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/** The satellite campus maps this environment lists. */
const campusMaps = manifest.maps.filter((path) => path.startsWith('/campus/'));

/**
 * What a visitor who has used the basemap gallery carries.
 *
 * `aggie_basemap` is the id the gallery stores for Aggieland, and the value that triggered this.
 */
const SAVED_PREFERENCE = { settings: { basemap: 'aggie_basemap' } };

test.describe('satellite campus basemaps', () => {
  test('the environment lists some campus maps to check', () => {
    // Without this, a discovery change that stops listing them would empty this file and still be
    // reported as green.
    expect(campusMaps.length, 'no /campus/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const mapPath of campusMaps) {
    test(`${mapPath} draws with a saved Aggieland basemap preference`, async ({ page }) => {
      await blockAnalytics(page);

      await page.addInitScript((preference) => {
        try {
          localStorage.setItem('user-preferences', JSON.stringify(preference));
        } catch {
          // Private browsing; the test still exercises the default branch.
        }
      }, SAVED_PREFERENCE);

      const response = await page.goto(mapPath);

      expect(response?.status(), `${mapPath} did not return 200`).toBe(200);
      await expect(page.locator(APP_ROOT)).not.toBeEmpty();

      const paint = await waitForPaint(page);

      test.info().annotations.push({
        type: 'paint',
        description: `dominant=${paint.colour} share=${paint.share.toFixed(3)} colours=${paint.colours}`
      });

      expect(
        paint.paintedAfterMs,
        `${mapPath} never painted for a visitor carrying a saved basemap preference: the canvas is ` +
          `${paint.share.toFixed(3)} ${paint.colour}, and a map that has drawn is below ${BLANK_ABOVE}. ` +
          `The campus basemap is a tiled layer and cannot be reprojected, so a view in another ` +
          `projection shows nothing.`
      ).not.toBeNull();
    });
  }
});
