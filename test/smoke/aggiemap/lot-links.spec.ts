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

interface LotLink {
  /** Which map, and which group of the issue's audit it stands for. */
  name: string;
  path: string;
  /** The map's layer the lot must be selected on. */
  layerId: string;
  /** That layer's address. The transportation GIS host is the same for every environment (getDefaultGisHosts()). */
  url: string;
  /** Finds the features the link may select, asked of the service: object ids change when it is republished. */
  where: string;
  objectIdField: string;
}

const VISITOR_PARKING: LotLink = {
  name: 'Visitor Parking, whose fields are named by table',
  path: '/parking/visitor-parking/map?lot=100j',
  layerId: 'Visitor Parking Lots',
  url: `${Connections.visitorParkingUrl}/1`,
  where: `GIS.TS.ParkingLots.Name = '100j'`,
  objectIdField: 'GIS.TS.ParkingLots.OBJECTID'
};

const LOT_LINKS: LotLink[] = [
  VISITOR_PARKING,
  {
    name: 'Motorcycle Parking, whose fields are not',
    path: '/parking/motorcycle-parking/map?lot=100j',
    layerId: 'motorcycle-parking-space',
    url: `${Connections.motorcycleParkingUrl}/0`,
    // A lot link on a map of spaces opens one of the lot's spaces.
    where: `LotName = '100j'`,
    objectIdField: 'OBJECTID'
  }
];

/**
 * Opens `path` and returns the share link of the popup it opens. For an event map's own feature the
 * link names it as `?feature=<layerId>:<objectId>`, the popup's own record of what was selected, so
 * it tells which feature of which layer the link opened, whatever the popup shows.
 */
async function openedLink(page: Page, path: string): Promise<URL> {
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
  await expect(popup, `${path} opened nothing`).not.toHaveClass(/hidden/, { timeout: 30_000 });

  // The copy field is a button named "Click to copy to clipboard." whose text is the link it copies.
  const shareLink = popup.getByRole('button', { name: 'Click to copy to clipboard.' }).filter({ hasText: /^https?:/ });
  await expect(shareLink, `${path} opened a popup with no share link`).toHaveCount(1, { timeout: 15_000 });

  return new URL((await shareLink.textContent())?.trim() ?? '');
}

/** The object ids of the features `link` may select, asked of its layer. */
async function expectedObjectIds(request: APIRequestContext, link: LotLink): Promise<number[]> {
  const response = await request.get(`${link.url}/query`, {
    params: { where: link.where, outFields: link.objectIdField, returnGeometry: 'false', f: 'json' },
    timeout: 30_000
  });
  const features: Array<{ attributes: Record<string, number> }> = (await response.json()).features ?? [];

  expect(features.length, `${link.url} has no feature where ${link.where}`).toBeGreaterThan(0);

  return features.map((feature) => feature.attributes[link.objectIdField]);
}

test.describe('lot links on the parking maps', () => {
  for (const link of LOT_LINKS) {
    test(`${link.path} opens the lot on ${link.layerId} (${link.name})`, async ({ page, request }) => {
      const objectIds = await expectedObjectIds(request, link);
      const opened = await openedLink(page, link.path);

      // On a map whose fields are named by table, the unfixed matcher found nothing on the map's own
      // layer, and the popup that opened was the main map's lot, shared as `/?lot=Lot 100j`.
      expect(
        objectIds.map((objectId) => `${link.layerId}:${objectId}`),
        `${link.path} opened a popup sharing ${decodeURIComponent(opened.href)}, not lot 100j on ${link.layerId}`
      ).toContain(opened.searchParams.get('feature'));
    });
  }

  test('a ?feature= link shared before opens the same lot on Visitor Parking as ?lot= does', async ({ page, request }) => {
    const [objectId] = await expectedObjectIds(request, VISITOR_PARKING);
    const feature = `${VISITOR_PARKING.layerId}:${objectId}`;

    const opened = await openedLink(page, `/parking/visitor-parking/map?feature=${encodeURIComponent(feature)}`);

    expect(opened.searchParams.get('feature')).toBe(feature);
  });
});
