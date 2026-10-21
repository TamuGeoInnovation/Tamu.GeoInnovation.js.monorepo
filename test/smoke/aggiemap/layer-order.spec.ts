import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

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
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

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
