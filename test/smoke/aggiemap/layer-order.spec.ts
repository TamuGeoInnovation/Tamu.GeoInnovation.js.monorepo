import * as fs from 'fs';
import * as path from 'path';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { isDevelopmentUrl, smokeBaseUrl } from './gis-hosts';

/**
 * A layer its definition orders above another is drawn above it (#2059).
 *
 * On Indoor Track Parking, both accessible spaces sit inside lots (100g and 100j), so the accessible spaces
 * must draw above the lots: the other way round, the lots' fill covers the wheelchair symbols, and every layer
 * still loads, holds its features and has a symbol for them, so nothing else in the suite would notice.
 *
 * Written for Team Bus Parking, an area that was the Indoor Track Building's own footprint and that the map
 * drew below the building, so the building covered it completely (#2059). #2468 removed that layer when the
 * athletics maps moved to one schema, and the test then timed out on every run waiting for it (#2507).
 *
 * The order is read from the map probe, whose layers are listed bottom first, once the map has finished
 * drawing, so it is the order on screen. Read on each of three fresh loads, because the order a map's
 * layers end up in has depended on what else had been added to the map by the time each was.
 *
 * Where the development GIS server is read, a map draws its development version, and a pair that version
 * does not have is skipped rather than failed: there is no order to check (#2350). The version's layers are read
 * from `declared-layers.generated.json`, which a unit test in `ts-events-ngx` keeps equal to the definitions,
 * so the skip ends by itself once the development version has both layers.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Whether this environment reads the development GIS server, and so draws a map's development version. */
const DEVELOPMENT_GIS = isDevelopmentUrl(smokeBaseUrl());

/** By map id, the layers each map's development version has, where it has one. */
const declared: Record<string, { developmentLayers?: string[] }> = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'declared-layers.generated.json'), 'utf8')
);

/** Fresh loads per map. */
const LOADS = 3;

/** Maps whose definitions order one layer above another, with the pair: `above` must draw above `below`. */
const ORDERS = [
  {
    route: '/parking/indoor-track-parking/map/d',
    above: 'indoor-track-parking-accessible-parking',
    below: 'indoor-track-parking-lots'
  },
  // The kiosk's buildings are a near-invisible click layer. Above the dining locations, they took every click on a
  // location inside a building and opened the building's popup instead (#2552).
  {
    route: '/kiosk/dining/map',
    above: 'dining-locations-layer',
    below: 'buildings-layer'
  },
  // The parking lots are filled areas; above the accessible spaces inside them, they cover the symbols (#2061).
  {
    route: '/events/muster/map/d',
    above: 'muster-accessible-parking',
    below: 'muster-parking'
  },
  // The road closures cross the lots' edges; below the lots, the lots' fill covers them (#2061). The map draws them
  // only for a chosen day, so the route is the builder's link for one.
  {
    route: '/events/graduation-spring/map/d?date=2026-05-06T05%3A00%3A00.000Z',
    above: 'graduation-road-closed',
    below: 'graduation-event-parking-lots'
  }
];

for (const order of ORDERS) {
  for (let load = 1; load <= LOADS; load++) {
    test(`${order.route} draws ${order.above} above ${order.below} (load ${load} of ${LOADS})`, async ({ page }) => {
      const development = DEVELOPMENT_GIS ? declared[order.route.split('/')[2] ?? '']?.developmentLayers : undefined;

      test.skip(
        development !== undefined && !(development.includes(order.above) && development.includes(order.below)),
        `the map's development version does not have both layers, so there is no order to check (#2143, #2350)`
      );

      await blockAnalytics(page);
      await page.goto(order.route, { waitUntil: 'domcontentloaded' });

      let ids: string[] = [];

      await expect
        .poll(
          async () => {
            ids = await page.evaluate(async (name) => {
              const probe = (
                window as unknown as Record<
                  string,
                  { ready?: boolean; drawing?: boolean; snapshot: () => Promise<{ layers: { id: string }[] }> }
                >
              )[name];

              return probe?.ready === true && probe.drawing === false
                ? (await probe.snapshot()).layers.map((layer) => layer.id)
                : [];
            }, PROBE_GLOBAL);

            return ids.includes(order.above) && ids.includes(order.below);
          },
          { message: `${order.route} never finished drawing both layers`, timeout: 90_000, intervals: [1_000] }
        )
        .toBe(true);

      expect(
        ids.indexOf(order.above),
        `${order.above} must be drawn above ${order.below}; the map's layers, bottom first: ${ids.join(', ')}`
      ).toBeGreaterThan(ids.indexOf(order.below));
    });
  }
}
