import { Page } from '@playwright/test';

// connections.ts loads without the Angular dependency graph (see services.spec.ts).
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
import { expect, HEAVY, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * Clicking a building opens the popup for **that** building, on every map that draws the campus buildings (#2707).
 *
 * `popup.spec.ts` clicks one point per map, chosen as a fraction of the viewport, so it answers "does a popup open" and
 * moves whenever the framing does: that is how it came to click Evans while asking for Harrington (#2701). This check
 * takes its points from the buildings layer itself - each building's centroid, turned into a screen point with
 * `view.toScreen` - so a point is the building wherever the map is framed, and the popup must name the building clicked.
 *
 * **Correctness gates; time only records.** Each click waits for its popup for up to `POPUP_TIMEOUT`, which is generous on
 * purpose. In headless Chromium `view.hitTest` alone takes 0.7 to 1.4 s, because WebGL runs in software, so the popup
 * names a building 2 to 3 s after the click (measured on dev on 9 November 2026). A bound tuned to that would say more
 * about the runner than about the map. The time of every click is printed and annotated, so a slow map can be read from
 * the report without being a failure.
 *
 * **No buildings query may fail.** A failed buildings tile is a part of the map where no building answers a click for
 * the rest of the visit, and that was #2707: the previous buildings service, layer 1 of the campus basemap, failed about
 * one query in twenty at random (4.7%, measured 9 November 2026), answering HTTP 200 with the error in the body, so nothing that reads a status noticed
 * (#2702). Measured with this check on 9 November 2026, every building it missed lay inside the area of a query that had
 * failed, and every run with no failed query named every building. So a failed query fails the check on its own, even
 * when no click happened to land in it. Each failure is named, with whether a missed building lies in its area.
 *
 * Add a map by adding a path. Each map is opened once and clicked `CLICKS` times.
 */

const MAPS = ['/map/d', '/parking/avp-parking/map/d', '/events/nsc-parking'];

/** Buildings clicked on each map. */
const CLICKS = 8;

/** How long one click may take to show its building. Generous: see above. */
const POPUP_TIMEOUT = 15_000;

/** The buildings layer every map built on the main map's sources draws (`main.definitions.ts`). */
const BUILDINGS_LAYER = 'buildings-layer';

/**
 * The buildings layer's own queries, whose failures leave buildings that cannot be clicked (#2702): the buildings service,
 * and the campus basemap's layer 1, which it replaced (#2707), so that a build still reading that is watched too.
 */
const BUILDINGS_QUERIES = [`${Connections.buildingsUrl}/query`, `${Connections.basemapUrl}/1/query`];

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** A building to click, at its centroid in page coordinates, and the centroid on the map. */
interface Target {
  name: string;
  x: number;
  y: number;
  mapX: number;
  mapY: number;
}

/** A failed buildings query, and the area of the map it asked for when that was an envelope (a tile). */
interface FailedQuery {
  answer: string;
  envelope: { xmin: number; ymin: number; xmax: number; ymax: number } | null;
}

/** The envelope a feature tile query asks for, from its `geometry` parameter, or `null` if it asked for something else. */
function envelopeOf(url: string): FailedQuery['envelope'] {
  try {
    const geometry = JSON.parse(new URL(url).searchParams.get('geometry') ?? 'null');

    return geometry && ['xmin', 'ymin', 'xmax', 'ymax'].every((key) => typeof geometry[key] === 'number') ? geometry : null;
  } catch {
    return null;
  }
}

/** Opens a map and waits until it has finished drawing, as `popup.spec.ts` does. */
async function openMap(page: Page, mapPath: string): Promise<void> {
  await blockAnalytics(page);
  await page.goto(mapPath);

  for (const [state, value, timeout] of [
    ['ready', true, 90_000],
    ['drawing', false, 60_000]
  ] as const) {
    await expect
      .poll(
        async () =>
          await page.evaluate(
            ({ name, state }) => (window as unknown as Record<string, Record<string, unknown>>)[name]?.[state],
            { name: PROBE_GLOBAL, state }
          ),
        { message: `the map on ${mapPath} never reported ${state}: ${value}`, timeout, intervals: [1_000] }
      )
      .toBe(value);
  }
}

/**
 * Buildings to click, taken from the buildings layer's own geometry in the current view. A building is used only where
 * its centroid lies inside it and inside no other building, clear of the view's edges, and where the map itself - not a
 * panel over it - is what a click there reaches. They are spread across the list rather than taken from its start.
 */
async function targets(page: Page, count: number): Promise<Target[]> {
  return await page.evaluate(
    async ({ layerId, count }) => {
      // The suite does not load Esri's types; this is the little of them it uses.
      type Point = { x: number; y: number };
      type Polygon = { centroid: Point; contains(point: Point): boolean };
      type Feature = { attributes: Record<string, unknown>; geometry: Polygon };
      type Layer = { queryFeatures(query: object): Promise<{ features: Feature[] }> };
      type View = {
        extent: object;
        width: number;
        height: number;
        map: { findLayerById(id: string): Layer | undefined };
        toScreen(point: Point): Point | null;
      };

      const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: View };
      const view = element.view;
      const layer = view.map.findLayerById(layerId);

      if (!layer) {
        return [];
      }

      // The service fails some queries at random (#2702), this one included, so it is asked up to three times.
      let features: Feature[] = [];

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          features = (await layer.queryFeatures({ geometry: view.extent, returnGeometry: true, outFields: ['*'] })).features;
          break;
        } catch (error) {
          if (attempt === 3) throw error;
        }
      }
      const page = element.getBoundingClientRect();
      const inset = 60;
      const found: Array<{ name: string; x: number; y: number; mapX: number; mapY: number }> = [];

      for (const feature of features) {
        const centroid = feature.geometry.centroid;
        // `bldgname` on the buildings service; `BldgName` on the basemap layer it replaced (#2707).
        const name = String(feature.attributes['bldgname'] ?? feature.attributes['BldgName'] ?? '').trim();
        const screen = centroid ? view.toScreen(centroid) : null;

        if (!name || !screen || !feature.geometry.contains(centroid)) continue;
        if (screen.x < inset || screen.y < inset || screen.x > view.width - inset || screen.y > view.height - inset)
          continue;
        if (features.some((other) => other !== feature && other.geometry.contains(centroid))) continue;

        const x = page.left + screen.x;
        const y = page.top + screen.y;

        if (!element.contains(document.elementFromPoint(x, y))) continue;

        found.push({ name, x, y, mapX: centroid.x, mapY: centroid.y });
      }

      const step = Math.max(1, Math.floor(found.length / count));

      return found.filter((_, index) => index % step === 0).slice(0, count);
    },
    { layerId: BUILDINGS_LAYER, count }
  );
}

/**
 * The buildings the layer itself does not answer for, asked with `view.hitTest` at each building's point once its
 * layer view has finished drawing.
 *
 * A click is also answered by the fallback that asks a layer still drawing (`click-query.ts`, #2707, #2785), so a
 * popup naming the building does not show the layer can be hit. On 9 November 2026 a layer that drew nothing, its
 * features held with no attributes, passed every click this check made, because each click landed while the fallback
 * still answered. This asks the layer directly, so a layer that draws nothing to hit fails here whatever answers
 * clicks.
 */
async function notHitTested(page: Page, buildings: Target[]): Promise<string[]> {
  return await page.evaluate(
    async ({ layerId, buildings }) => {
      type Hit = { graphic?: { layer?: unknown } };
      type View = {
        map: { findLayerById(id: string): unknown };
        whenLayerView(layer: unknown): Promise<{ updating: boolean }>;
        hitTest(point: { x: number; y: number }, options: object): Promise<{ results: Hit[] }>;
      };

      const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: View };
      const view = element.view;
      const layer = view.map.findLayerById(layerId);
      const layerView = await view.whenLayerView(layer);
      const rect = element.getBoundingClientRect();
      const start = Date.now();

      while (layerView.updating && Date.now() - start < 60_000) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      const missed: string[] = [];

      for (const building of buildings) {
        const { results } = await view.hitTest(
          { x: building.x - rect.left, y: building.y - rect.top },
          { include: [layer] }
        );

        if (!results.some((result) => result.graphic?.layer === layer)) {
          missed.push(building.name);
        }
      }

      return missed;
    },
    { layerId: BUILDINGS_LAYER, buildings }
  );
}

test.describe('clicking a building', () => {
  for (const mapPath of MAPS) {
    test(`${mapPath}: each building clicked opens its own popup`, HEAVY, async ({ page }) => {
      test.setTimeout(120_000 + CLICKS * POPUP_TIMEOUT);

      const failedQueries: FailedQuery[] = [];
      let queries = 0;

      page.on('response', (response) => {
        if (!BUILDINGS_QUERIES.some((query) => response.url().startsWith(query))) return;

        queries++;

        void response
          .text()
          .then((body) => {
            if (response.status() >= 400 || /"error"\s*:/.test(body)) {
              failedQueries.push({
                answer: `${response.status()} ${body.slice(0, 100)}`,
                envelope: envelopeOf(response.url())
              });
            }
          })
          .catch(() => undefined);
      });

      await openMap(page, mapPath);

      const buildings = await targets(page, CLICKS);

      expect(buildings.length, `${mapPath} has no ${BUILDINGS_LAYER} buildings in view to click`).toBe(CLICKS);

      const unhit = await notHitTested(page, buildings);

      // Only a popup on screen: one a click closed stays in the page, hidden, still naming the last building.
      const popup = page.locator('tamu-gisc-feature-popup .popup:visible');
      const results: Array<{ building: Target; ms: number | null; showed: string }> = [];

      for (const building of buildings) {
        const start = Date.now();
        const expected = building.name.replace(/\s+/g, ' ');
        let showed = '';

        // The last building's popup panel may now cover this one; Escape closes it, as a visitor would.
        const covered = await page.evaluate(
          ({ x, y }) => !document.querySelector('arcgis-map')?.contains(document.elementFromPoint(x, y)),
          building
        );

        if (covered) {
          await page.keyboard.press('Escape');
        }

        await page.mouse.click(building.x, building.y);

        while (Date.now() - start < POPUP_TIMEOUT) {
          showed = ((await popup.allTextContents()).at(-1) ?? '').replace(/\s+/g, ' ').trim();

          if (showed.includes(expected)) break;

          await page.waitForTimeout(100);
        }

        results.push({ building, ms: showed.includes(expected) ? Date.now() - start : null, showed });
      }

      const measured =
        results.map((result) => `${result.building.name}: ${result.ms === null ? 'missed' : `${result.ms} ms`}`).join('; ') +
        `; buildings queries failed: ${failedQueries.length} of ${queries}` +
        `; hit test found the layer at ${buildings.length - unhit.length} of ${buildings.length}`;

      // Annotated for the HTML report, and logged because a local run's list reporter shows no annotations.
      test.info().annotations.push({ type: 'building clicks (#2707)', description: measured });
      console.log(`[smoke] building clicks on ${mapPath} (#2707): ${measured}`);

      // A missed building inside the area a failed query asked for is one the map never received (#2702).
      const inFailedTile = ({ mapX, mapY }: Target) =>
        failedQueries.some(
          ({ envelope: e }) => e !== null && mapX >= e.xmin && mapX <= e.xmax && mapY >= e.ymin && mapY <= e.ymax
        );
      const missed = results
        .filter((result) => result.ms === null)
        .map(
          (result) =>
            `${result.building.name} (popup showed: ${result.showed.slice(0, 60) || 'nothing'}` +
            `${inFailedTile(result.building) ? '; inside a buildings tile whose query failed' : ''})`
        );

      expect
        .soft(
          missed,
          `buildings on ${mapPath} whose click did not open their own popup within ${POPUP_TIMEOUT / 1000} s. ` +
            (failedQueries.length > 0
              ? `${failedQueries.length} buildings queries failed during this run (#2702), which leaves buildings that ` +
                `cannot be clicked: ${failedQueries.map((query) => query.answer).join(' | ')}`
              : 'No buildings query failed during this run, so the buildings were all loaded')
        )
        .toEqual([]);

      expect
        .soft(
          failedQueries.map((query) => query.answer),
          `buildings queries on ${mapPath} that failed, answered with the error in the body (#2702). Each leaves a part of ` +
            'the map where no building can be clicked for the rest of the visit, whether or not a click here landed in it'
        )
        .toEqual([]);

      expect(
        unhit,
        `buildings on ${mapPath} that ${BUILDINGS_LAYER} does not answer a hit test for, once it has drawn. Clicks on them ` +
          'can still open a popup through the fallback for a layer still drawing, which is how a layer that drew nothing ' +
          'passed this check on 9 November 2026 (#2707)'
      ).toEqual([]);
    });
  }
});
