import { expect, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { blockAnalytics } from './analytics';
import { BLANK_ABOVE, waitForPaint } from './paint';
import { readFraming } from './framing';

/**
 * Zoomed all the way in, the map still has a basemap (#1577).
 *
 * The production basemap is a cached tile service whose tiling scheme lists 24 levels but which has
 * tiles only down to level 21 (1:282). The views allowed any zoom, so the last two levels requested
 * tiles the service does not have, and the map went white under the layers. ArcGIS does not even ask
 * for them - the service's tile map says they are missing - so no request fails; the canvas is simply
 * empty. Every layer still reported itself loaded and drawn, which is why nothing else noticed.
 */

/** The zoom-in button of Esri's zoom widget. */
const ZOOM_IN = '.esri-zoom .esri-widget--button >> nth=0';

test.describe('the basemap at the deepest zoom', () => {
  test('the main map has basemap tiles at every level it lets you zoom to', async ({ page }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);

    const response = await page.goto('/map/d');

    expect(response?.status(), '/map/d did not return 200').toBe(200);
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();
    await waitForPaint(page);

    // Zoom in until the widget refuses: that is the deepest level the view allows.
    const zoomIn = page.locator(ZOOM_IN);

    for (let i = 0; i < 30 && !(await zoomIn.getAttribute('class'))?.includes('esri-disabled'); i++) {
      await zoomIn.click();
      await page.waitForTimeout(1_000);
    }

    const framing = await readFraming(page);
    // Thirty seconds, not the full paint allowance: the map has already drawn once at this point.
    const paint = await waitForPaint(page, 30_000);

    test.info().annotations.push({
      type: 'paint',
      description: `zoom=${framing?.zoom} dominant=${paint.colour} share=${paint.share.toFixed(3)}`
    });

    expect(
      paint.paintedAfterMs,
      `zoomed all the way in (zoom ${framing?.zoom}), the map is ${paint.share.toFixed(3)} ${paint.colour}, ` +
        `and a map that has drawn is below ${BLANK_ABOVE}. The view's maxScale must stop at the deepest ` +
        `level the basemap has tiles for.`
    ).not.toBeNull();
  });
});
