import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * One map's settings are never used on another (#1397).
 *
 * An event or kiosk map can change how it draws a main-map layer it also loads, through its
 * `defaultLayerOverrides`: the dining kiosk turned the dining layer on, Break/Summer removes the
 * surface lots' popups, the Ring Days, SEC Grounds and football hide construction. Those settings
 * were kept for the whole page, not for the map that set them, so going back to the main map in the
 * same tab drew it with the event map's settings until the page was reloaded.
 *
 * Each case opens the main map, moves inside the app to the other map, then uses the browser's Back
 * button, which returns to the main map without reloading the page. The main map must then show
 * every layer exactly as it did when first opened.
 *
 * Only what the probe reports can be compared, which is each layer's visibility. A popup setting
 * such as Break/Summer's is not visible to it, so that case checks the rest of the map only.
 *
 * Add a map by adding a route.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Maps that set `defaultLayerOverrides`, opened at a route that needs no builder choices. */
const ROUTES = ['/kiosk/dining/map', '/parking/break-summer/map/d', '/events/ring-day/map/d?event-day=day1'];

type Visibility = Record<string, boolean>;

/** Each layer's visibility, by id, once the current map has finished loading. Null while it has not. */
async function visibility(page: Page): Promise<Visibility | null> {
  return await page.evaluate(async (name) => {
    const probe = (
      window as unknown as Record<
        string,
        { ready?: boolean; snapshot: () => Promise<{ layers: { id: string; visible: boolean }[] }> } | undefined
      >
    )[name];

    if (probe?.ready !== true) {
      return null;
    }

    // Layers without an id of their own, such as a view's graphics layer, get a generated one that
    // differs on every load, so they cannot be matched up and are left out.
    return Object.fromEntries(
      (await probe.snapshot()).layers
        .filter((layer) => !/^[0-9a-f]+-layer-\d+$/.test(layer.id))
        .map((layer) => [layer.id, layer.visible])
    );
  }, PROBE_GLOBAL);
}

const sameLayers = (a: Visibility, b: Visibility): boolean => Object.keys(a).sort().join() === Object.keys(b).sort().join();

/** Waits for the map now loading, told apart from the one before by its different set of layers. */
async function waitForMap(page: Page, isIt: (layers: Visibility) => boolean, what: string): Promise<Visibility> {
  let loaded: Visibility | null = null;

  await expect
    .poll(
      async () => {
        loaded = await visibility(page);

        return loaded !== null && isIt(loaded);
      },
      { timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true)
    .catch(() => {
      throw new Error(`${what} never finished loading. Last seen: ${JSON.stringify(loaded && Object.keys(loaded).sort())}`);
    });

  return loaded as unknown as Visibility;
}

test.describe("another map's settings do not carry over to the main map", () => {
  for (const route of ROUTES) {
    test(`the main map is unchanged after visiting ${route}`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto('/map', { waitUntil: 'domcontentloaded' });

      const fresh = await waitForMap(page, () => true, 'the main map');

      // Marks this page, so a reload anywhere below is caught rather than passing for the wrong reason.
      await page.evaluate(() => ((window as unknown as Record<string, boolean>)['__isolationCheck'] = true));

      // In-app navigation, as a link inside the app does it: the router follows the history change.
      await page.evaluate((path) => {
        history.pushState(null, '', path);
        dispatchEvent(new PopStateEvent('popstate', { state: null }));
      }, route);

      await waitForMap(page, (layers) => !sameLayers(layers, fresh), route);

      await page.goBack();

      const after = await waitForMap(page, (layers) => sameLayers(layers, fresh), 'the main map, after Back,');

      expect(
        await page.evaluate(() => (window as unknown as Record<string, boolean>)['__isolationCheck']),
        'the page reloaded, so this did not test navigation inside the app'
      ).toBe(true);

      const changed = Object.keys(fresh).filter((id) => fresh[id] !== after[id]);

      expect(
        changed.map(
          (id) => `${id}: ${fresh[id] ? 'visible' : 'hidden'} when first opened, ${after[id] ? 'visible' : 'hidden'} after`
        ),
        `the main map drew these layers with ${route}'s settings`
      ).toEqual([]);
    });
  }
});
