import { expect, HEAVY, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { blockAnalytics } from './analytics';
import { BLANK_ABOVE, waitForPaintAndHold } from './paint';

/**
 * A plain load of the main map draws a map (#2487).
 *
 * The hatch's sprite override on the vector tile basemap blanked the map: every load when it was applied
 * after the layer view existed (#2481), about one load in four when it is applied as the layer loads. The
 * map reported itself ready, every layer loaded and drawable, while the canvas was white, so unit tests,
 * `check-in-volume.sh`, CI and the rest of this suite all passed and the build reached dev - twice.
 *
 * Only a plain load shows it: `/map/d` with no deep link and no nudging, a fresh browser context each
 * time. The map is the vector tile basemap on development and the raster basemap on production, so this
 * passes there for the boring reason and checks what it should wherever the vector basemap is served.
 *
 * **Why several loads, each its own test, with no retries.** A fault that blanks one load in four fails a
 * single load a quarter of the time, which is exactly what a flaky test looks like, and `retries: 2` in
 * the suite's config would turn nearly every such failure into a pass. So there is one test per load,
 * retries are switched off for them, and a blank load is a failure that says which load of how many.
 * A fault that blanks every load fails all of them. Nothing here is flaky by construction: a healthy map
 * draws within seconds, so a load that stays white for the whole allowance is the fault, not the test.
 *
 * Six loads catch a one-in-four fault in 82% of runs (1 - 0.75^6) and a certain one in every run. That
 * is a count, not a guarantee; raise `AGGIEMAP_SMOKE_BLANK_LOADS` to look harder.
 */
const LOADS = Number(process.env.AGGIEMAP_SMOKE_BLANK_LOADS ?? 6);

/**
 * Long enough for a slow healthy load, short enough that a blank one does not hold a worker for the full
 * paint allowance. A blank map stays white for as long as it is watched (at least 30 seconds were
 * measured). A healthy one draws in seconds on an idle machine but took 35 to 55 seconds with six loads
 * sharing it: a first version ran these on the suite's six workers with 45 seconds and failed healthy
 * maps that were only slow. So they are `@heavy`, which gives them the machine two at a time, and the
 * allowance is longer than anything seen there.
 */
const BLANK_ALLOWANCE_MS = 60_000;

test.describe('a plain load of the main map draws', () => {
  test.describe.configure({ retries: 0 });

  for (let load = 1; load <= LOADS; load++) {
    test(`/map/d draws on a plain load     (${load} of ${LOADS})`, HEAVY, async ({ page }) => {
      test.setTimeout(180_000);
      await blockAnalytics(page);

      const response = await page.goto('/map/d');

      expect(response?.status(), '/map/d did not return 200').toBe(200);
      await expect(page.locator(APP_ROOT)).not.toBeEmpty();

      const paint = await waitForPaintAndHold(page, BLANK_ALLOWANCE_MS);

      test.info().annotations.push({
        type: 'paint',
        description:
          `load ${load} of ${LOADS}: dominant=${paint.colour} share=${paint.share.toFixed(3)} ` +
          `paintedAfter=${paint.paintedAfterMs === null ? 'never' : paint.paintedAfterMs + 'ms'}`
      });

      expect(
        paint.paintedAfterMs,
        `/map/d, plain load ${load} of ${LOADS}, was blank: the canvas is ${paint.share.toFixed(3)} ${paint.colour} ` +
          `after ${BLANK_ALLOWANCE_MS / 1000}s, and a map that has drawn is below ${BLANK_ABOVE}. This is a real ` +
          `failure, not flakiness: the map reports itself ready while the canvas is empty (#2487), and a fault ` +
          `that blanks some loads fails some of these and not others`
      ).not.toBeNull();
    });
  }
});
