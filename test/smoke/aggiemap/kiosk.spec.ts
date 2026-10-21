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
  graphicTypes: Record<string, number> | null;
}

/**
 * Opens a kiosk in this test's fresh browser context and returns its layers once its own have loaded.
 * `link` may carry a query, such as a `?tent=` link; the kiosk must keep it in place, not redirect it.
 */
async function openKiosk(
  page: Page,
  link: string = KIOSK_ROUTE,
  ownLayerIds: string[] = KIOSK_LAYER_IDS
): Promise<ProbeLayer[]> {
  const route = link.split('?')[0];

  await blockAnalytics(page);
  await page.goto(link, { waitUntil: 'domcontentloaded' });

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

        return ownLayerIds.every((id) => layers?.some((l) => l.id === id && (l.loaded || l.error !== null)));
      },
      { message: `${link} never finished loading its own layers`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);

  // A kiosk map has no sidebar, so it must not be redirected into the sidebar shell (`/map/d`).
  expect(new URL(page.url()).pathname, 'the kiosk was redirected into the sidebar shell').toBe(route);

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

/**
 * The Football Tailgating kiosk (#1975): the tailgating map with no sidebar, drawing the tailgating
 * map's own layers and the buildings, and nothing else of the main map's. `?tent=` and `?zone=` links
 * select their feature as they do on the tailgating map, where `selection.spec.ts` checks them.
 */
const TAILGATING_KIOSK_ROUTE = '/kiosk/football-tailgating/map';

/** Every layer the tailgating kiosk's definition adds: the tailgating map's own, and the buildings. */
const TAILGATING_KIOSK_LAYER_IDS = [
  'tailgating-zone-numbers',
  'tailgating-tents',
  'tailgating-simpson-tents',
  'tailgating-aggie-park',
  'tailgating-west-campus',
  'tailgating-construction',
  'buildings-layer'
];

/**
 * The layers that must have features. Construction is left out: it shows only the projects that affect
 * tailgating, and a project that ends leaves it rightly empty.
 */
const TAILGATING_KIOSK_LAYERS_WITH_FEATURES = TAILGATING_KIOSK_LAYER_IDS.filter((id) => id !== 'tailgating-construction');

const SELECTION_LAYER_ID = 'selection-layer';

/** Waits until the map has finished drawing, which is what a screen showing it needs. */
async function finishesDrawing(page: Page, link: string): Promise<void> {
  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { drawing?: boolean }>)[name]?.drawing === false,
          PROBE_GLOBAL
        ),
      { message: `${link} never finished drawing`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);
}

test("the football tailgating kiosk draws its own layers, none of the main map's, and finishes drawing", async ({
  page
}) => {
  const layers = await openKiosk(page, TAILGATING_KIOSK_ROUTE, TAILGATING_KIOSK_LAYER_IDS);

  for (const id of TAILGATING_KIOSK_LAYER_IDS) {
    const layer = layers.find((l) => l.id === id);

    expect(layer?.error ?? null, `${id} failed to load on ${TAILGATING_KIOSK_ROUTE}`).toBeNull();
    expect(layer?.visible, `${id} is on ${TAILGATING_KIOSK_ROUTE} but hidden`).toBe(true);
  }

  for (const id of TAILGATING_KIOSK_LAYERS_WITH_FEATURES) {
    expect(layers.find((l) => l.id === id)?.featureCount ?? 0, `${id} has no features`).toBeGreaterThan(0);
  }

  const others = layers.filter((l) => !BASEMAP_TYPES.includes(l.type) && !TAILGATING_KIOSK_LAYER_IDS.includes(l.id));

  expect(
    others.map((l) => l.id),
    `${TAILGATING_KIOSK_ROUTE} also loads the main map's layers`
  ).toEqual([]);

  await finishesDrawing(page, TAILGATING_KIOSK_ROUTE);
});

/** A tent and a zone link, with the title its popup shows. */
const TAILGATING_KIOSK_LINKS = [
  { link: `${TAILGATING_KIOSK_ROUTE}?tent=L1`, title: 'Tent L1' },
  { link: `${TAILGATING_KIOSK_ROUTE}?zone=AP-7`, title: null }
];

for (const { link, title } of TAILGATING_KIOSK_LINKS) {
  test(`${link} selects its feature on the football tailgating kiosk`, async ({ page }) => {
    await openKiosk(page, link, TAILGATING_KIOSK_LAYER_IDS);

    await expect
      .poll(
        async () =>
          await page.evaluate(
            async ({ name, selection }) => {
              const probe = (
                window as unknown as Record<string, { ready?: boolean; snapshot: () => Promise<{ layers: ProbeLayer[] }> }>
              )[name];
              const layer =
                probe?.ready === true ? (await probe.snapshot()).layers.find((l) => l.id === selection) : undefined;

              return Object.values(layer?.graphicTypes ?? {}).reduce((sum, count) => sum + count, 0);
            },
            { name: PROBE_GLOBAL, selection: SELECTION_LAYER_ID }
          ),
        { message: `${link} never selected a feature`, timeout: 90_000, intervals: [1_000] }
      )
      .toBeGreaterThan(0);

    // The tent's own popup, so it is the linked tent that was selected and not another feature.
    if (title) {
      await expect(
        page.getByText(title, { exact: true }).first(),
        `${link} did not open the popup for ${title}`
      ).toBeVisible({
        timeout: 30_000
      });
    }
  });
}
