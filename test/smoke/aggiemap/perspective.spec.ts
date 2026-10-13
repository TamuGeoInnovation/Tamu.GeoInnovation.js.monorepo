import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { Framing, waitForSettledFraming } from './framing';

/**
 * Switching a map between 2D and 3D keeps it where it was (#1724).
 *
 * On 12 October the main map moved about 2.4 km south when switched to 3D, and came back to 2D still
 * there: the 3D view was tilted without being told what to tilt around, and the 2D view then took
 * the tilted scene's position as its own. Nothing in the suite switched a map's perspective, so
 * nothing noticed.
 *
 * The check is on the place, not the picture: the centre of the view, read from the map probe, before
 * the switch, in 3D, and back in 2D.
 */

const MAP = '/map/d';
const TOGGLE = 'tamu-gisc-perspective-toggle';

/**
 * How far the centre may move. A tilted scene and a flat map do not agree to the metre on what is
 * "at the centre", so 3D is given some room; coming back to 2D is given almost none.
 */
const IN_3D_WITHIN_M = 150;
const BACK_IN_2D_WITHIN_M = 25;

/** Metres between two `[longitude, latitude]` centres; campus is small enough for a flat reckoning. */
function metresBetween(a: Framing['center'], b: Framing['center']): number {
  const north = (b[1] - a[1]) * 111_320;
  const east = (b[0] - a[0]) * 111_320 * Math.cos((a[1] * Math.PI) / 180);

  return Math.hypot(north, east);
}

test.describe('2D and 3D', () => {
  test('switching the main map to 3D and back keeps it where it was', async ({ page }) => {
    test.setTimeout(300_000);
    await blockAnalytics(page);
    await page.goto(MAP);

    const framed = async (what: string): Promise<Framing> => {
      const { framing } = await waitForSettledFraming(page, `${MAP} ${what}`);

      expect(framing, `${MAP} ${what} has no framing to read`).not.toBeNull();

      return framing as Framing;
    };

    const toggle = page.locator(TOGGLE).first();
    const flat = await framed('as loaded');

    await toggle.click();
    await expect(toggle, 'the toggle never said the map was in 3D').toHaveText('3D', { timeout: 60_000 });

    const tilted = await framed('in 3D');

    expect(
      metresBetween(flat.center, tilted.center),
      `switching to 3D moved the map from ${flat.center} to ${tilted.center}`
    ).toBeLessThan(IN_3D_WITHIN_M);

    await toggle.click();
    await expect(toggle, 'the toggle never said the map was back in 2D').toHaveText('2D', { timeout: 60_000 });

    const back = await framed('back in 2D');

    expect(
      metresBetween(flat.center, back.center),
      `coming back to 2D left the map at ${back.center}, not ${flat.center} where it started`
    ).toBeLessThan(BACK_IN_2D_WITHIN_M);
    expect(back.zoom, 'coming back to 2D changed the zoom').toBe(flat.zoom);
  });
});
