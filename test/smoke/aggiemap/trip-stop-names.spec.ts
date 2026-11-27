import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { developmentSectionsVisible } from './development-only';
import { waitForMapDrawn, waitForMapReady } from './map-probe';

/**
 * A stop set by clicking the map is named after what was clicked (#2723).
 *
 * The trip planner asked only the buildings layer what a click landed on, so a click on anything else set a stop named
 * by its coordinates: the lab clicked Eli Whitely Park's Nature Rx marker in 24 loads and 23 set `30.6146, -96.3493`, and
 * this spec's first run on dev, on 26 November 2026, set it on 3 loads of 3 and 24 of 24. The route was right; only the
 * name was wrong. The maintainer's rule (8 November 2026): the clicked feature's own layer first, coordinates only on
 * bare ground. So three cases, each asserting the stop's name:
 *
 * - **A Nature Rx marker** names the stop after the space. Over `LOADS` loads, since the lab saw it right once in 24
 *   and one passing load proves nothing. Nature Rx is development-only (#2673), so it is clicked only where
 *   development-only features are shown.
 * - **A building** is still the building, on the same loads: the measurement named 110 buildings of 110, and that stays.
 * - **Bare ground** is still its coordinates.
 *
 * Points are taken from the features themselves and turned into screen points with `view.toScreen`, as
 * `building-clicks.spec.ts` does, so they hold wherever the map is framed.
 */

const PLANNER = 'tamu-gisc-sidebar-trip-planner';
const STOPS = `${PLANNER} tamu-gisc-search input`;

/** The Nature Rx space the lab measured, and how many loads click it. */
const SPACE = 'Eli Whitely Park';
const LOADS = 3;

/** A stop named by its coordinates, as the trip planner writes them: `30.6146, -96.3493`. */
const COORDINATES = /^-?\d+\.\d+, -?\d+\.\d+$/;

/** A point to click in page coordinates, and the name the stop should take there, if any. */
interface Spot {
  x: number;
  y: number;
  name: string | null;
}

/** Opens the trip planner and waits for its map to finish drawing, as a visitor would before clicking. */
async function openPlanner(page: Page): Promise<void> {
  await blockAnalytics(page);
  await page.goto('/map/d/trip');
  await waitForMapReady(page, 'the map on /map/d/trip never reported ready: true');
  await expect(page.locator(STOPS), '/map/d/trip did not show the from and to boxes').toHaveCount(2, { timeout: 30_000 });
}

/**
 * Turns Nature Rx on, as a visitor does from Layers, frames `SPACE`, and returns its marker on the page once the map has
 * drawn there.
 */
async function natureRxMarker(page: Page): Promise<Spot> {
  const framed = await page.evaluate(async (space) => {
    const view = (document.querySelector('arcgis-map') as unknown as { view: EsriView }).view;
    const layer = view.map.findLayerById('nature-rx-layer');

    if (!layer) {
      return 'the map has no nature-rx-layer';
    }

    layer.visible = true;
    const { features } = await layer.queryFeatures({
      where: `area_name = '${space}'`,
      returnGeometry: true,
      outSpatialReference: view.spatialReference
    });

    if (features.length !== 1) {
      return `Nature Rx has ${features.length} spaces named ${space}`;
    }

    await view.goTo({ target: features[0].geometry, zoom: 18 }, { animate: false });

    return null;
  }, SPACE);

  expect(framed, framed ?? '').toBeNull();
  await waitForMapDrawn(page, `the map never finished drawing around ${SPACE}`, {
    timeout: 60_000,
    until: (layers) => layers.some((l) => l.id === 'nature-rx-layer' && l.visible && l.loaded && (l.featureCount ?? 0) > 0)
  });

  return await page.evaluate(async (space) => {
    const view = (document.querySelector('arcgis-map') as unknown as { view: EsriView }).view;
    const { features } = await view.map
      .findLayerById('nature-rx-layer')
      .queryFeatures({ where: `area_name = '${space}'`, returnGeometry: true, outSpatialReference: view.spatialReference });

    return { ...onPage(view, features[0].geometry), name: space };

    function onPage(v: EsriView, point: object) {
      const box = (document.querySelector('arcgis-map') as HTMLElement).getBoundingClientRect();
      const screen = v.toScreen(point);

      return { x: box.left + screen.x, y: box.top + screen.y };
    }
  }, SPACE);
}

/**
 * A building in view to click, at a centroid inside it where the buildings layer is the only thing a hit test finds, and
 * its name; or bare ground, a point in view where a hit test finds nothing and no building or lot lies.
 */
async function spotInView(page: Page, kind: 'building' | 'ground'): Promise<Spot | string> {
  return await page.evaluate(async (kind) => {
    const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: EsriView };
    const view = element.view;
    const box = element.getBoundingClientRect();
    const inset = 80;
    const inView = (s: { x: number; y: number }) =>
      s.x > inset && s.y > inset && s.x < view.width - inset && s.y < view.height - inset;
    const hits = async (s: { x: number; y: number }) =>
      (await view.hitTest(s)).results.map((r) => r.graphic?.layer?.id).filter((id): id is string => Boolean(id));

    if (kind === 'building') {
      const { features } = await view.map.findLayerById('buildings-layer').queryFeatures({
        geometry: view.extent,
        outFields: ['*'],
        returnGeometry: true,
        outSpatialReference: view.spatialReference
      });

      for (const feature of features) {
        const name = Object.entries(feature.attributes).find(([key]) => key.toLowerCase() === 'bldgname')?.[1];
        const centroid = feature.geometry?.centroid;

        if (typeof name !== 'string' || name === '' || !centroid || !feature.geometry.contains(centroid)) {
          continue;
        }

        const screen = view.toScreen(centroid);
        const under = screen && inView(screen) ? await hits(screen) : [];

        if (under.length > 0 && under.every((id) => id === 'buildings-layer')) {
          return { x: box.left + screen.x, y: box.top + screen.y, name };
        }
      }

      return 'no building in view could be clicked on its own';
    }

    for (let row = 1; row < 8; row++) {
      for (let column = 1; column < 8; column++) {
        const screen = { x: (view.width * column) / 8, y: (view.height * row) / 8 };

        if (!inView(screen) || (await hits(screen)).length > 0) {
          continue;
        }

        const point = view.toMap(screen);
        const answers = await Promise.all(
          ['buildings-layer', 'surface-lots-layer'].map(async (id) => {
            const layer = view.map.findLayerById(id);

            return layer ? (await layer.queryFeatures({ geometry: point, spatialRelationship: 'intersects' })).features.length : 0;
          })
        );

        if (answers.every((count) => count === 0)) {
          return { x: box.left + screen.x, y: box.top + screen.y, name: null };
        }
      }
    }

    return 'no bare ground in view';
  }, kind);
}

/** Clicks a spot and returns the stop the click set: the box it filled, which was empty before. */
async function clickForStop(page: Page, spot: Spot, box: number): Promise<string> {
  await page.mouse.click(spot.x, spot.y);
  await expect(page.locator(STOPS).nth(box), `the click at ${spot.x}, ${spot.y} set no stop`).not.toHaveValue('', {
    timeout: 20_000
  });

  return await page.locator(STOPS).nth(box).inputValue();
}

test.describe('a stop set by a map click is named after what was clicked (#2723)', () => {
  for (let load = 1; load <= LOADS; load++) {
    test(`${SPACE}'s Nature Rx marker, then a building (load ${load} of ${LOADS})`, async ({ page }) => {
      test.skip(!developmentSectionsVisible(), 'Nature Rx is development-only (#2673): a production build leaves it out');
      test.setTimeout(180_000);

      await openPlanner(page);

      const marker = await natureRxMarker(page);
      expect(await clickForStop(page, marker, 0), `the stop set by clicking ${SPACE}'s marker`).toBe(SPACE);

      const building = await spotInView(page, 'building');
      expect(typeof building, String(building)).toBe('object');
      const spot = building as Spot;
      expect(await clickForStop(page, spot, 1), 'the stop set by clicking a building').toBe(spot.name);
    });
  }

  test('bare ground is named by its coordinates', async ({ page }) => {
    test.setTimeout(150_000);

    await openPlanner(page);
    await waitForMapDrawn(page, 'the map on /map/d/trip never finished drawing', { timeout: 60_000 });

    const ground = await spotInView(page, 'ground');
    expect(typeof ground, String(ground)).toBe('object');
    expect(await clickForStop(page, ground as Spot, 0), 'the stop set by clicking bare ground').toMatch(COORDINATES);
  });
});

/** The little of Esri's types this spec uses; the suite does not load them. */
interface EsriFeature {
  attributes: Record<string, unknown>;
  geometry: { centroid?: object; contains(point: object): boolean };
}

interface EsriLayer {
  visible: boolean;
  queryFeatures(query: object): Promise<{ features: EsriFeature[] }>;
}

interface EsriView {
  width: number;
  height: number;
  extent: object;
  spatialReference: object;
  map: { findLayerById(id: string): EsriLayer };
  goTo(target: object, options: object): Promise<void>;
  hitTest(point: { x: number; y: number }): Promise<{ results: Array<{ graphic?: { layer?: { id?: string } } }> }>;
  toScreen(point: object): { x: number; y: number };
  toMap(point: { x: number; y: number }): object;
}
