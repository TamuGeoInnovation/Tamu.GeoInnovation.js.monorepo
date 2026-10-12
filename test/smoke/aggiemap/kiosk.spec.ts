import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * The dining kiosk draws its dining locations (#1392).
 *
 * `/kiosk/dining/map` is a sidebar-free map meant to be embedded elsewhere, and dining locations are
 * the one thing it exists to show. It opened on the basemap alone. Like every event map it loads the
 * main map's layers as well as its own, and both define `dining-locations-layer`. The kiosk's setting
 * that turned dining on reached only the main map's copy, and only one layer per id reaches the map:
 * whichever loaded first won, and on most loads that was the kiosk's own copy, still hidden. Every
 * layer loaded, nothing errored, and `maps.spec.ts` passed it, because a hidden layer with features is
 * a healthy layer.
 *
 * Because the fault was a race, one load proves little: the map is opened several times, each in a
 * fresh browser context, and must draw dining every time.
 *
 * A kiosk shows exactly what its own definition says. Loading the main map's layers is what made the
 * race possible, and drew campus layers (parking lots, space numbers, the 150th events) a dining kiosk
 * has no use for, so kiosk maps now load none of them, and that is checked too.
 *
 * Opened by direct link rather than discovered: All Maps lists kiosk maps on development only, and
 * production serves this map by link, so `global-setup.ts` never finds it there.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

const KIOSK_ROUTE = '/kiosk/dining/map';
const DINING_LAYER_ID = 'dining-locations-layer';

/** Every layer the dining kiosk's own definition adds. Anything else that is not basemap came from the main map. */
const KIOSK_LAYER_IDS = ['buildings-layer', DINING_LAYER_ID];

/** Probe layer types a basemap is made of. */
const BASEMAP_TYPES = ['tile', 'vector-tile'];

/** Fresh loads per run. Before the fix, dining drew on none of 11 such loads across dev, production and local. */
const LOADS = 3;

interface ProbeLayer {
  id: string;
  type: string;
  visible: boolean;
  loaded: boolean;
  error: string | null;
  featureCount: number | null;
}

/** Opens the kiosk in this test's fresh browser context and returns its layers once its own have loaded. */
async function openKiosk(page: Page): Promise<ProbeLayer[]> {
  await blockAnalytics(page);
  await page.goto(KIOSK_ROUTE, { waitUntil: 'domcontentloaded' });

  const snapshot = async (): Promise<ProbeLayer[] | null> =>
    await page.evaluate(async (name) => {
      const probe = (
        window as unknown as Record<string, { ready?: boolean; snapshot: () => Promise<{ layers: ProbeLayer[] }> }>
      )[name];

      return probe?.ready === true ? (await probe.snapshot()).layers : null;
    }, PROBE_GLOBAL);

  let layers: ProbeLayer[] | null = null;

  // The map's own layers are added shortly after the map itself, so wait for them, not only for "ready".
  await expect
    .poll(
      async () => {
        layers = await snapshot();

        return KIOSK_LAYER_IDS.every((id) => layers?.some((l) => l.id === id && (l.loaded || l.error !== null)));
      },
      { message: `${KIOSK_ROUTE} never finished loading its own layers`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);

  // A kiosk map has no sidebar, so it must not be redirected into the sidebar shell (`/map/d`).
  expect(new URL(page.url()).pathname, 'the kiosk was redirected into the sidebar shell').toBe(KIOSK_ROUTE);

  return layers ?? [];
}

for (let load = 1; load <= LOADS; load++) {
  test(`the dining kiosk draws its dining locations, with no sidebar (load ${load} of ${LOADS})`, async ({ page }) => {
    const dining = (await openKiosk(page)).find((l) => l.id === DINING_LAYER_ID);

    expect(dining, `${KIOSK_ROUTE} has no ${DINING_LAYER_ID}`).toBeDefined();
    expect(dining?.error, `${DINING_LAYER_ID} failed to load`).toBeNull();
    expect(dining?.visible, `${DINING_LAYER_ID} is on the map but hidden, so the kiosk shows no dining locations`).toBe(
      true
    );
    expect(dining?.featureCount ?? 0, `${DINING_LAYER_ID} has no features`).toBeGreaterThan(0);
  });
}

test("the dining kiosk holds only its own layers and the basemap, none of the main map's", async ({ page }) => {
  const others = (await openKiosk(page))
    .filter((l) => !BASEMAP_TYPES.includes(l.type) && !KIOSK_LAYER_IDS.includes(l.id))
    .map((l) => l.id);

  expect(others, `${KIOSK_ROUTE} also loads the main map's layers`).toEqual([]);
});
