import * as fs from 'fs';
import * as path from 'path';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { environmentIsDevelopment } from './gis-hosts';

/**
 * A layer its definition orders above another is drawn above it (#2059).
 *
 * On Indoor Track Parking, Team Bus Parking is an area that is the Indoor Track Building's own footprint,
 * and its definition orders it above the building. The map drew it below, so the building's fill covered
 * it completely and switching it on and off changed nothing on the map. Every layer loaded, held its
 * feature and had a symbol for it, so nothing else in the suite could notice.
 *
 * The order is read from the map probe, whose layers are listed bottom first, once the map has finished
 * drawing, so it is the order on screen. Read on each of three fresh loads, because the order a map's
 * layers end up in has depended on what else had been added to the map by the time each was.
 *
 * Where the development GIS server is read, a map draws its development version, and a pair that version
 * does not have is skipped rather than failed: there is no order to check (#2350). Indoor Track's development
 * view has no Team Bus Parking, deliberately (#2143; the GIS team confirmed it on 23 October 2026), so on dev
 * the test could only time out waiting for a layer the map is not meant to draw. The version's layers are read
 * from `declared-layers.generated.json`, which a unit test in `ts-events-ngx` keeps equal to the definitions,
 * so the skip ends by itself once the development version has both layers.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Whether this environment reads the development GIS server, and so draws a map's development version. */
const DEVELOPMENT_GIS = environmentIsDevelopment(process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu');

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
    above: 'indoor-track-parking-team-bus',
    below: 'indoor-track-parking-building'
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
