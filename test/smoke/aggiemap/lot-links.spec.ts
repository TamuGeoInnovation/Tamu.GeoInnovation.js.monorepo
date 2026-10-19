import { APIRequestContext, Page } from '@playwright/test';

// connections.ts loads here without the Angular dependency graph, as in services.spec.ts, so the
// layer asked about below is the one the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * A `?lot=` link opens the lot on a parking map, whether its service names its fields by table or not
 * (#1952).
 *
 * Fourteen of Transportation Services' parking services join several tables, so a lot's name is
 * `GIS.TS.ParkingLots.LotName`, not `LotName`, and the app compared field names whole: on those maps
 * `?lot=100j` opened nothing. The rest name their fields plainly and always worked. One map from each
 * group is checked, so the audit in the issue stays true, and on the first the lot is also opened by
 * the `?feature=<layerId>:<objectId>` form every popup has shared since June, which must still open the
 * same lot.
 *
 * Visitor Parking stands for the first group rather than AVP Parking, the map the issue was found on,
 * because AVP's service fails about half its queries (#1951) and a link that cannot load says nothing
 * about how it was matched.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';
const POPUP = 'tamu-gisc-feature-popup .popup';

// The transportation GIS host is the same for every environment (see getDefaultGisHosts() in connections.ts).
const VISITOR_LOTS = { layerId: 'Visitor Parking Lots', url: `${Connections.visitorParkingUrl}/1` };

const LOT_LINKS = [
  {
    name: 'Visitor Parking, whose fields are named by table',
    path: '/parking/visitor-parking/map?lot=100j',
    shows: /Lot 100j/
  },
  { name: 'Motorcycle Parking, whose fields are not', path: '/parking/motorcycle-parking/map?lot=100j', shows: /100j/ }
];

/** Opens `path` and waits for its map to finish loading, then for the popup the link opens. */
async function openLink(page: Page, path: string, shows: RegExp): Promise<void> {
  await blockAnalytics(page);
  await page.goto(path);

  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message: `the map on ${path} never finished loading`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);

  const popup = page.locator(POPUP);
  await expect(popup, `${path} did not open the lot`).not.toHaveClass(/hidden/, { timeout: 30_000 });
  await expect(popup, `${path} did not show the lot`).toContainText(shows, { timeout: 15_000 });
}

/** Lot 100j's object id in Visitor Parking, asked of the service: it changes when the service is republished. */
async function visitorLot100jObjectId(request: APIRequestContext): Promise<number> {
  const response = await request.get(`${VISITOR_LOTS.url}/query`, {
    params: {
      where: `GIS.TS.ParkingLots.Name = '100j'`,
      outFields: 'GIS.TS.ParkingLots.OBJECTID',
      returnGeometry: 'false',
      f: 'json'
    },
    timeout: 30_000
  });
  const features: Array<{ attributes: Record<string, number> }> = (await response.json()).features ?? [];

  expect(features, 'Visitor Parking has no Lot 100j').toHaveLength(1);

  return features[0].attributes['GIS.TS.ParkingLots.OBJECTID'];
}

test.describe('lot links on the parking maps', () => {
  for (const { name, path, shows } of LOT_LINKS) {
    test(`${path} opens the lot (${name})`, async ({ page }) => {
      await openLink(page, path, shows);
    });
  }

  test('a ?feature= link shared before still opens the same lot on Visitor Parking', async ({ page, request }) => {
    const objectId = await visitorLot100jObjectId(request);
    const feature = encodeURIComponent(`${VISITOR_LOTS.layerId}:${objectId}`);

    await openLink(page, `/parking/visitor-parking/map?feature=${feature}`, /Lot 100j/);
  });
});
