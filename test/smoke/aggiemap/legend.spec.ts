import { expect, test } from '@playwright/test';

import { blockAnalytics } from './analytics';

/**
 * The legend shows what the map draws (#1721).
 *
 * A hosted layer loads with the symbol its service publishes and is then given the one its portal item
 * publishes (#1497). The legend used to keep whichever it drew first. Which that was depended on which
 * answered sooner, so most visits were right and some were not: on 12 October the Football
 * micromobility legend showed Entry Routes as a wide bar, the service's flattened symbol, beside a map
 * drawing a thin line with an arrowhead.
 *
 * So the order is forced here. Every portal item's symbology is held back long enough for the legend
 * to be drawn without it, and the legend's symbol must then change when it arrives.
 */

/** Entry Routes: a 15-point line as its service publishes it, a 1.95-point line with an arrowhead on its item. */
const MAP = '/events/gameday-parking/map/d?transport-type=micromobility&direction=entry';
const LAYER = 'Entry Routes';

/** Longer than a legend takes to draw, shorter than anyone would wait. */
const HELD_MS = 15_000;

/**
 * A legend symbol keeps its size beside a long label (#1804).
 *
 * Each legend row is a flex row of the symbol and its label. The symbol's wrapper was allowed to shrink,
 * so a long enough label squeezed it: on the Baseball Event Map the main event parking entry, whose
 * label lists every permit it accepts, drew its 24-pixel symbol 4 pixels wide (#1778).
 */
const LONG_LABEL_MAP = '/parking/baseball-parking/map/d?map-mode=event';
const LONG_LABEL = 'Event Parking';

/** Narrower than any symbol a service publishes, wider than a squeezed one. */
const MIN_SYMBOL_PX = 12;

test.describe('legend', () => {
  test('a symbol follows its layer when the portal symbology arrives after the legend is drawn', async ({ page }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);

    let arrived = false;

    await page.route('**/sharing/rest/content/items/*/data*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, HELD_MS));
      arrived = true;
      await route.continue();
    });

    await page.goto(MAP);

    const symbol = page
      .locator('tamu-gisc-legend-element .legend-info', { hasText: LAYER })
      .locator('.image-container')
      .first();

    await expect(symbol, `the legend never listed ${LAYER}`).toBeVisible({ timeout: 90_000 });

    const first = await symbol.innerHTML();

    // If the page was slow enough that the symbology was already in, the legend was drawn once, from
    // the right symbol, and this run cannot tell a fixed legend from a broken one.
    test.skip(arrived, 'the legend was drawn after the portal symbology arrived, so there was nothing to follow');

    await expect
      .poll(async () => await symbol.innerHTML(), {
        message: `the legend still shows the symbol ${LAYER} had before its portal symbology arrived`,
        timeout: HELD_MS + 60_000
      })
      .not.toBe(first);
  });

  test('a symbol keeps its size beside a long label', async ({ page }) => {
    test.setTimeout(120_000);
    await blockAnalytics(page);
    await page.goto(LONG_LABEL_MAP);

    const rows = page.locator('tamu-gisc-legend-element .legend-info:visible', { has: page.locator('.image-container') });
    await expect(rows.filter({ hasText: LONG_LABEL }).first(), `the legend never listed ${LONG_LABEL}`).toBeVisible({
      timeout: 90_000
    });

    const symbols = await rows.evaluateAll((elements) =>
      elements.map((row) => ({
        label: (row.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
        width: Math.round((row.querySelector('.image-container')?.getBoundingClientRect().width ?? 0) * 10) / 10
      }))
    );
    const squeezed = symbols.filter((symbol) => symbol.width < MIN_SYMBOL_PX);

    expect(squeezed, `legend symbols narrower than ${MIN_SYMBOL_PX} px, of ${symbols.length}`).toEqual([]);
  });
});
