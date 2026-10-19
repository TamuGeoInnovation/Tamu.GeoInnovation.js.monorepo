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

/**
 * The Layers list, the legend and the map follow a layer switched off and on, from either side (#1672).
 *
 * Both lists draw from Esri's own objects, which change outside Angular: a layer's `visible` is set on
 * the layer, and the list item and the legend entry read it back. A component that stops repainting
 * when such a field changes, which is what OnPush does to a component reading a field its inputs did
 * not replace (#1669), still compiles, still passes its unit tests and still draws correctly on load. It
 * shows only after a click, as a dot or a legend entry left as it was.
 *
 * So the layer is switched off from the Layers list and must leave the legend and the map, switched on
 * from its legend title and must come back to all three, and then the same the other way round.
 */
const TOGGLE_MAP = '/parking/visitor-parking';
const TOGGLE_LAYER = 'Visitor Kiosks';

/**
 * The main map's legend lists a layer switched on from the Layers list (#1857).
 *
 * Every layer on the main map loads hidden. The legend keeps a layer it has once seen visible, so that
 * one switched off collapses instead of disappearing, and it only looked again when Esri's list of
 * layers changed. That list keeps hidden layers too, so switching one on never changed it, and the main
 * map's legend stayed empty whatever was switched on. The Visitor Parking map above was unaffected
 * because its layers load visible.
 *
 * And it leaves the legend when it is switched off again (#1871). Keeping it collapsed is for a legend
 * whose titles switch layers back on, as the event maps' do; the main map's legend has none, so a layer
 * kept there stayed listed, symbols and all, though the map no longer drew it.
 */
const MAIN_MAP = '/map/d';
const MAIN_MAP_LAYERS = ['Visitor Parking', 'Construction Zones'];

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

  test('a layer switched off and on, from the Layers list and from the legend, is followed by both and by the map', async ({
    page
  }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);
    await page.goto(TOGGLE_MAP);

    const exactly = new RegExp(`^\\s*${TOGGLE_LAYER}\\s*$`);
    const listItem = page
      .locator('tamu-gisc-layer-list-item .layer-item')
      .filter({ has: page.locator('p', { hasText: exactly }) });
    const entry = page
      .locator('tamu-gisc-legend tamu-gisc-legend-collection')
      .filter({ has: page.locator('.collection-group-title-text', { hasText: exactly }) })
      .first();
    const entryTitle = entry.locator('.collection-group-title');
    const entrySymbol = entry.locator('.collection-group-content .legend-info').first();

    /** The layer's visibility as the map holds it, from the map probe; null until the map is ready. */
    const onTheMap = () =>
      page.evaluate(async (title) => {
        const probe = (
          window as unknown as Record<
            string,
            { ready?: boolean; snapshot(): Promise<{ layers: Array<{ title: string; visible: boolean }> }> } | undefined
          >
        )['__tamuGiscMapProbe'];

        if (probe?.ready !== true) {
          return null;
        }

        return (await probe.snapshot()).layers.find((layer) => layer.title === title)?.visible ?? null;
      }, TOGGLE_LAYER);

    /** The map, the Layers list and the legend all show the layer on, or all show it off. */
    const expectAllShow = async (on: boolean, after: string) => {
      const state = `${TOGGLE_LAYER} ${on ? 'on' : 'off'}`;

      await expect.poll(onTheMap, { message: `after ${after}, the map does not have ${state}`, timeout: 30_000 }).toBe(on);

      if (on) {
        await expect(listItem, `after ${after}, the Layers list does not show ${state}`).toHaveClass(/\bvisible\b/);
        await expect(entrySymbol, `after ${after}, the legend does not show ${state}`).toBeVisible();
      } else {
        await expect(listItem, `after ${after}, the Layers list does not show ${state}`).not.toHaveClass(/\bvisible\b/);
        await expect(entrySymbol, `after ${after}, the legend does not show ${state}`).toBeHidden();
      }
    };

    await expect(entrySymbol, `the legend never listed ${TOGGLE_LAYER}`).toBeVisible({ timeout: 90_000 });
    await expectAllShow(true, 'loading');

    await listItem.locator('p').click();
    await expectAllShow(false, 'switching it off in the Layers list');

    await entryTitle.click();
    await expectAllShow(true, 'switching it on from its legend title');

    await entryTitle.click();
    await expectAllShow(false, 'switching it off from its legend title');

    await listItem.locator('p').click();
    await expectAllShow(true, 'switching it back on in the Layers list');
  });

  test('a layer that loads hidden is listed once it is switched on in the Layers list, and leaves once switched off', async ({
    page
  }) => {
    test.setTimeout(300_000);
    await blockAnalytics(page);
    await page.goto(MAIN_MAP);

    // Switch layers on once the map has finished, as a visitor would. While layers are still loading,
    // Esri's list keeps changing, and a layer switched on then was listed by the old legend too. The main
    // map took about a minute to finish drawing on a local dev server.
    await page.waitForFunction(
      () => {
        const probe = (window as unknown as Record<string, { ready?: boolean; drawing?: boolean } | undefined>)[
          '__tamuGiscMapProbe'
        ];

        return probe?.ready === true && probe.drawing === false;
      },
      null,
      { timeout: 180_000 }
    );

    for (const title of MAIN_MAP_LAYERS) {
      const exactly = new RegExp(`^\\s*${title}\\s*$`);
      const listItem = page
        .locator('tamu-gisc-layer-list-item .layer-item')
        .filter({ has: page.locator('p', { hasText: exactly }) });
      // The main map's legend gives a layer no title of its own: one symbol is labelled with the layer's
      // title, and several are headed by it.
      const entrySymbol = page
        .locator('tamu-gisc-legend tamu-gisc-legend-collection', { hasText: title })
        .locator('.legend-info')
        .first();

      await expect(listItem, `the Layers list never listed ${title}`).toBeVisible({ timeout: 90_000 });
      await expect(listItem, `${title} is already on, so switching it on tests nothing`).not.toHaveClass(/\bvisible\b/);
      await expect(entrySymbol, `the legend lists ${title} before it is switched on`).toBeHidden();

      await listItem.locator('p').click();

      await expect(listItem, `the Layers list does not show ${title} on`).toHaveClass(/\bvisible\b/);
      await expect(entrySymbol, `the legend never listed ${title} after it was switched on`).toBeVisible({
        timeout: 60_000
      });

      await listItem.locator('p').click();

      await expect(listItem, `the Layers list does not show ${title} off`).not.toHaveClass(/visible/);
      await expect(entrySymbol, `the legend still lists ${title} after it was switched off`).toBeHidden({ timeout: 30_000 });

      await listItem.locator('p').click();

      await expect(entrySymbol, `the legend never listed ${title} again after it was switched back on`).toBeVisible({
        timeout: 60_000
      });
    }
  });
});
