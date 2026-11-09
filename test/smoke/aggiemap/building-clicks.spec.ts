import * as fs from 'fs';
import * as path from 'path';

import { Page } from '@playwright/test';

// connections.ts loads without the Angular dependency graph (see services.spec.ts).
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
import { expect, HEAVY, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { readFraming, servedRoutes } from './framing';
import { smokeBaseUrl } from './gis-hosts';
import { MANIFEST_PATH, MapManifest } from './global-setup';

/**
 * Clicking a feature opens the popup for **that** feature, on every map (#2707, #2778).
 *
 * `popup.spec.ts` clicks one point per map, chosen as a fraction of the viewport, so it answers "does a popup open" and
 * moves whenever the framing does: that is how it came to click Evans while asking for Harrington (#2701). This check
 * takes its points from the layers themselves - each feature's centroid, turned into a screen point with `view.toScreen`
 * - so a point is the feature wherever the map is framed, and the popup must name the feature clicked. The framing is
 * read, not assumed, and printed with the result.
 *
 * **Every polygon layer that opens a popup**, not only the buildings (#2778): the maintainer's requirement is that
 * "map clicking to select features on the map needs to work on all maps, not just the main map". On each map, up to
 * `BUILDING_CLICKS` buildings and up to `LAYER_CLICKS` features of every other such layer in view are clicked: parking
 * lots, a campus's property, an event's areas. The popup must show one of the feature's names - its layer's
 * `popupData.name`, or the feature's own name fields - so a feature with no name to show is not clicked. Point and
 * line layers are not clicked: a marker is reached by its symbol, not its geometry, so a point taken from the feature
 * can miss it by the symbol's size. They are still asked: a point where any other layer that opens a popup answers a
 * hit test is not used, since that layer rightly answers the click first. Measured on every map on dev on 9 November
 * 2026, most of the misses in a version without that rule were a bike rack, a bus stop or an event's own lot answering a
 * click on a building or a campus lot; most of the rest were names it had not resolved.
 *
 * **Which maps.** A release run clicks `RELEASE_MAPS`: the main map and one map from each section that draws the
 * buildings differently: 1.8 minutes on dev. Every other run - the nightly on GitHub, and `full` locally - clicks every
 * map the environment serves, one route each (`servedRoutes`): 77 to 84 maps, 25 minutes on production with no retries
 * and 50 on dev with them, both measured on 9 November 2026. Both read `AGGIEMAP_SMOKE_FRAMING`, which `run-local.sh` sets to `release` unless told otherwise.
 *
 * **A rate, not a single miss** (#2778). Each map passes when at least `MIN_RATE` of its clicks open their own popup,
 * and reports every click either way, so "13 of 14" is visible on a map that passed. A map with nothing in view to
 * click fails rather than passing having clicked nothing.
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
 */

/** The maps a release run clicks: the main map, and one from each other section, each drawing its own layers. */
const RELEASE_MAPS = [
  '/map/d',
  '/parking/avp-parking/map/d',
  '/events/nsc-parking',
  '/events/tailgating',
  '/campus/galveston',
  '/operations/construction-map'
];

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const MAPS = process.env.AGGIEMAP_SMOKE_FRAMING === 'release' ? RELEASE_MAPS : servedRoutes(manifest, { onePerMap: true });

/**
 * Layers whose clicks are known not to open their popup here, by layer id, each tied to its issue: from
 * `environments.json`'s `allowedClickFailures`. Their features are still clicked and reported, and left out of the rate;
 * a listed layer whose clicks all open says so, so its entry can go (as `allowedPopupFailures` does, #657).
 */
function allowedClickFailures(): Record<string, string> {
  const environments: Record<string, { baseUrl: string; allowedClickFailures?: Record<string, string> }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === smokeBaseUrl());

  return match?.allowedClickFailures ?? {};
}

const ALLOWED_CLICK_FAILURES = allowedClickFailures();

/** Buildings clicked on each map. */
const BUILDING_CLICKS = 6;

/** Features clicked in each other polygon layer that opens a popup. */
const LAYER_CLICKS = 2;

/** The most clicks one map gets, whatever it draws. */
const MAX_CLICKS = 14;

/** The share of a map's clicks that must open their own popup. One miss in fourteen passes; two do not. */
const MIN_RATE = 0.9;

/** How long one click may take to show its feature. Generous: see above. */
const POPUP_TIMEOUT = 15_000;

/** The buildings layer every map built on the main map's sources draws (`main.definitions.ts`). */
const BUILDINGS_LAYER = 'buildings-layer';

/**
 * The buildings layer's own queries, whose failures leave buildings that cannot be clicked (#2702): the buildings service,
 * and the campus basemap's layer 1, which it replaced (#2707), so that a build still reading that is watched too.
 */
const BUILDINGS_QUERIES = [`${Connections.buildingsUrl}/query`, `${Connections.basemapUrl}/1/query`];

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** A feature to click, at its centroid in page coordinates, and the centroid on the map. */
interface Target {
  layer: string;
  /** The names its popup may show: see `targets`. */
  names: string[];
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

/**
 * Opens a map, waits until it has finished drawing, as `popup.spec.ts` does, and closes what a visitor would close
 * before clicking: a past event's notice, or a map's own, covers the map until it is dismissed.
 */
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

  for (let closed = 0; closed < 3 && (await page.locator('tamu-gisc-modal-host').count()) > 0; closed++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

/**
 * Features to click, taken from each polygon layer's own geometry in the current view: the layers that open a popup,
 * drawn and visible. A feature is used only where its centroid lies inside it and inside no other feature of its layer,
 * clear of the view's edges, where the map itself - not a panel over it - is what a click there reaches, and where no
 * other layer that opens a popup is hit: a bike rack's symbol over a building, or an event's lot over the campus one,
 * answers the click first, rightly, and that is not this feature's popup. They are spread across each layer's list
 * rather than taken from its start.
 */
async function targets(page: Page): Promise<Target[]> {
  return await page.evaluate(
    async ({ buildingsId, buildingClicks, layerClicks, maxClicks }) => {
      // The suite does not load Esri's types; this is the little of them it uses.
      type Point = { x: number; y: number };
      type Polygon = { type: string; centroid: Point; contains(point: Point): boolean };
      type Feature = { attributes: Record<string, unknown>; geometry: Polygon | null };
      type Layer = {
        id: string;
        visible: boolean;
        geometryType?: string;
        popupComponent?: unknown;
        popupData?: Record<string, unknown>;
        queryFeatures?(query: object): Promise<{ features: Feature[] }>;
      };
      type View = {
        extent: object;
        width: number;
        height: number;
        spatialReference: object;
        map: { allLayers: { toArray(): Layer[] } };
        whenLayerView(layer: Layer): Promise<{ suspended: boolean; updating: boolean }>;
        hitTest(point: Point, options: object): Promise<{ results: unknown[] }>;
        toScreen(point: Point): Point | null;
      };

      const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: View };
      const view = element.view;
      const page = element.getBoundingClientRect();
      const inset = 60;

      const text = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');
      const path = (record: unknown, keys: string) =>
        keys.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], record);

      /**
       * The names a popup may give a feature: its layer's `popupData.name`, resolved as `popup.service.ts` resolves it -
       * a template, a path such as `attributes.name`, or a field - and the feature's own name fields. A satellite
       * campus's popup takes its title from the campus's configuration (`buildingPopup.title`), which a page cannot
       * read, so any of the feature's names counts.
       */
      const namesOf = (layer: Layer, attributes: Record<string, unknown>): string[] => {
        const named = layer.popupData?.['name'];
        let fromPopupData: unknown;

        if (typeof named === 'string') {
          fromPopupData = /[{}]/.test(named)
            ? named.replace(/\{attributes\.([^}]+)\}/g, (_, field: string) => text(attributes[field]))
            : path({ attributes }, named);
          fromPopupData = /[{}]/.test(text(fromPopupData)) ? '' : fromPopupData;
        } else if (named && typeof named === 'object' && 'field' in named) {
          const { field, collapsed } = named as { field: string; collapsed?: boolean };

          fromPopupData = collapsed ? attributes[field] : path(attributes, field);
        }

        // `bldgname` on the buildings service, `BldgName` on the basemap layer it replaced (#2707); `lotname` and
        // `LotName` likewise for lots (#2722); `name` on a satellite campus's buildings.
        const fields = ['bldgname', 'BldgName', 'lotname', 'LotName', 'Name', 'name'].map((field) => attributes[field]);

        return [...new Set([fromPopupData, ...fields].map(text).filter(Boolean))];
      };

      const layers: Array<{ layer: Layer; features: Feature[] }> = [];
      const popupLayers: Layer[] = [];

      for (const layer of view.map.allLayers.toArray()) {
        if (!layer.popupComponent || typeof layer.queryFeatures !== 'function' || !layer.visible) continue;

        const layerView = await view.whenLayerView(layer);

        if (layerView.suspended) continue;

        popupLayers.push(layer);

        const start = Date.now();

        while (layerView.updating && Date.now() - start < 60_000) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (layer.geometryType !== 'polygon') continue;

        // The services fail some queries at random (#2702), this one included, so each is asked up to three times.
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const query = {
              geometry: view.extent,
              outSpatialReference: view.spatialReference,
              returnGeometry: true,
              outFields: ['*']
            };

            layers.push({ layer, features: (await layer.queryFeatures(query)).features });
            break;
          } catch (error) {
            if (attempt === 3) throw error;
          }
        }
      }

      const chosen: Array<Target & { order: number }> = [];

      for (const { layer, features } of layers) {
        const found: Target[] = [];

        for (const feature of features) {
          const geometry = feature.geometry;
          const centroid = geometry?.type === 'polygon' ? geometry.centroid : null;
          const names = namesOf(layer, feature.attributes);
          const screen = centroid ? view.toScreen(centroid) : null;

          if (names.length === 0 || !centroid || !screen || !geometry!.contains(centroid)) continue;
          if (screen.x < inset || screen.y < inset || screen.x > view.width - inset || screen.y > view.height - inset)
            continue;
          if (features.some((other) => other !== feature && other.geometry?.contains(centroid))) continue;

          const x = page.left + screen.x;
          const y = page.top + screen.y;

          if (!element.contains(document.elementFromPoint(x, y))) continue;

          found.push({ layer: layer.id, names, x, y, mapX: centroid.x, mapY: centroid.y });
        }

        const count = layer.id === buildingsId ? buildingClicks : layerClicks;
        const step = Math.max(1, Math.floor(found.length / count));
        // Spread across the list, then the rest in order, so a feature another layer covers is replaced by the next.
        const spread = [
          ...found.filter((_, index) => index % step === 0),
          ...found.filter((_, index) => index % step !== 0)
        ];
        const others = popupLayers.filter((other) => other !== layer);
        let order = 0;

        for (const target of spread) {
          if (order === count) break;

          const point = { x: target.x - page.left, y: target.y - page.top };

          if (others.length > 0 && (await view.hitTest(point, { include: others })).results.length > 0) continue;

          chosen.push({ ...target, order: order++ });
        }
      }

      // Taken a round at a time across the layers, so a map with many layers still clicks each of them.
      return chosen
        .sort((a, b) => a.order - b.order)
        .slice(0, maxClicks)
        .map(({ order, ...target }) => target);
    },
    { buildingsId: BUILDINGS_LAYER, buildingClicks: BUILDING_CLICKS, layerClicks: LAYER_CLICKS, maxClicks: MAX_CLICKS }
  );
}

/**
 * The features their own layer does not answer for, asked with `view.hitTest` at each feature's point once its layer
 * view has finished drawing.
 *
 * A click is also answered by the fallback that asks a layer still drawing (`click-query.ts`, #2707, #2785), so a
 * popup naming the feature does not show the layer can be hit. On 9 November 2026 a layer that drew nothing, its
 * features held with no attributes, passed every click this check made, because each click landed while the fallback
 * still answered. This asks the layer directly, so a layer that draws nothing to hit fails here whatever answers
 * clicks.
 */
async function notHitTested(page: Page, features: Target[]): Promise<Target[]> {
  return await page.evaluate(
    async ({ features }) => {
      type Hit = { graphic?: { layer?: unknown } };
      type View = {
        map: { findLayerById(id: string): unknown };
        whenLayerView(layer: unknown): Promise<{ updating: boolean }>;
        hitTest(point: { x: number; y: number }, options: object): Promise<{ results: Hit[] }>;
      };

      const element = document.querySelector('arcgis-map') as unknown as HTMLElement & { view: View };
      const view = element.view;
      const rect = element.getBoundingClientRect();
      const missed: typeof features = [];

      for (const feature of features) {
        const layer = view.map.findLayerById(feature.layer);
        const layerView = await view.whenLayerView(layer);
        const start = Date.now();

        while (layerView.updating && Date.now() - start < 60_000) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        const { results } = await view.hitTest({ x: feature.x - rect.left, y: feature.y - rect.top }, { include: [layer] });

        if (!results.some((result) => result.graphic?.layer === layer)) {
          missed.push(feature);
        }
      }

      return missed;
    },
    { features }
  );
}

test.describe('clicking a feature', () => {
  test('a release run clicks maps this environment serves', () => {
    // Without this, a map renamed or retired would quietly drop out of the release set.
    // A served route is the map's own address (`/map`, `/parking/avp-parking`); a release map may be one of its pages.
    const served = servedRoutes(manifest, { onePerMap: false }).map((route) => route.split('?')[0]);
    const missing = RELEASE_MAPS.filter(
      (route) => !served.some((servedRoute) => route === servedRoute || route.startsWith(`${servedRoute}/`))
    );

    expect(missing, 'maps in RELEASE_MAPS that this environment does not serve; choose another in its section').toEqual([]);
  });

  for (const mapPath of MAPS) {
    test(`${mapPath}: each feature clicked opens its own popup`, HEAVY, async ({ page }) => {
      test.setTimeout(120_000 + MAX_CLICKS * POPUP_TIMEOUT);

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

      const framing = await readFraming(page);
      const features = await targets(page);

      expect(
        features.length,
        `${mapPath} has no feature in view that opens a popup and can be clicked (framed at ` +
          `${framing ? `zoom ${framing.zoom}, ${framing.center.join(', ')}` : 'an unreadable framing'})`
      ).toBeGreaterThan(0);

      const unhit = await notHitTested(page, features);

      // Only a popup on screen: one a click closed stays in the page, hidden, still naming the last feature.
      const popup = page.locator('tamu-gisc-feature-popup .popup:visible');
      const results: Array<{ feature: Target; ms: number | null; showed: string }> = [];

      for (const feature of features) {
        const start = Date.now();
        const expected = feature.names.map((name) => name.replace(/\s+/g, ' '));
        const named = (popupText: string) => expected.some((name) => popupText.includes(name));
        let showed = '';

        // The last feature's popup panel may now cover this one; Escape closes it, as a visitor would.
        const covered = await page.evaluate(
          ({ x, y }) => !document.querySelector('arcgis-map')?.contains(document.elementFromPoint(x, y)),
          feature
        );

        if (covered) {
          await page.keyboard.press('Escape');
        }

        await page.mouse.click(feature.x, feature.y);

        while (Date.now() - start < POPUP_TIMEOUT) {
          showed = ((await popup.allTextContents()).at(-1) ?? '').replace(/\s+/g, ' ').trim();

          if (named(showed)) break;

          await page.waitForTimeout(100);
        }

        results.push({ feature, ms: named(showed) ? Date.now() - start : null, showed });
      }

      // Clicks on a layer known not to answer are reported, and left out of the rate.
      const counted = results.filter((result) => !(result.feature.layer in ALLOWED_CLICK_FAILURES));
      const opened = counted.filter((result) => result.ms !== null).length;

      for (const [layer, known] of Object.entries(ALLOWED_CLICK_FAILURES)) {
        const clicked = results.filter((result) => result.feature.layer === layer);

        if (clicked.length > 0) {
          const missedHere = clicked.filter((result) => result.ms === null).length;

          test.info().annotations.push({
            type: missedHere > 0 ? 'known failure' : 'known failure now passing',
            description:
              missedHere > 0
                ? `${mapPath}: ${missedHere} of ${clicked.length} clicks on ${layer} opened nothing of theirs (${known})`
                : `${mapPath}: every click on ${layer} opened its popup; remove it from allowedClickFailures (${known})`
          });
        }
      }
      const measured =
        `${opened} of ${counted.length} clicks opened their own popup` +
        (counted.length < results.length ? ` (and ${results.length - counted.length} on known failures)` : '') +
        (framing ? ` (zoom ${framing.zoom}, ${framing.center.join(', ')})` : '') +
        ': ' +
        results
          .map(
            (result) =>
              `${result.feature.names[0]} [${result.feature.layer}]: ${result.ms === null ? 'missed' : `${result.ms} ms`}`
          )
          .join('; ') +
        `; buildings queries failed: ${failedQueries.length} of ${queries}` +
        `; hit test found the layer at ${features.length - unhit.length} of ${features.length}`;

      // Annotated for the HTML report, and logged because a local run's list reporter shows no annotations.
      test.info().annotations.push({ type: 'feature clicks (#2778)', description: measured });
      console.log(`[smoke] feature clicks on ${mapPath} (#2778): ${measured}`);

      // A missed building inside the area a failed query asked for is one the map never received (#2702).
      const inFailedTile = ({ mapX, mapY }: Target) =>
        failedQueries.some(
          ({ envelope: e }) => e !== null && mapX >= e.xmin && mapX <= e.xmax && mapY >= e.ymin && mapY <= e.ymax
        );
      const missed = counted
        .filter((result) => result.ms === null)
        .map(
          (result) =>
            `${result.feature.names[0]} in ${result.feature.layer} (popup showed: ${result.showed.slice(0, 60) || 'nothing'}` +
            `${result.feature.layer === BUILDINGS_LAYER && inFailedTile(result.feature) ? '; inside a buildings tile whose query failed' : ''})`
        );

      expect(
        counted.length,
        `every feature clicked on ${mapPath} is on a layer in allowedClickFailures, so nothing here was checked`
      ).toBeGreaterThan(0);

      expect
        .soft(
          opened / counted.length,
          `only ${opened} of ${counted.length} clicks on ${mapPath} opened their own popup within ` +
            `${POPUP_TIMEOUT / 1000} s, below ${MIN_RATE * 100}%. Missed: ${missed.join('; ')}. ` +
            (failedQueries.length > 0
              ? `${failedQueries.length} buildings queries failed during this run (#2702), which leaves buildings that ` +
                `cannot be clicked: ${failedQueries.map((query) => query.answer).join(' | ')}`
              : 'No buildings query failed during this run, so the buildings were all loaded')
        )
        .toBeGreaterThanOrEqual(MIN_RATE);

      expect
        .soft(
          failedQueries.map((query) => query.answer),
          `buildings queries on ${mapPath} that failed, answered with the error in the body (#2702). Each leaves a part of ` +
            'the map where no building can be clicked for the rest of the visit, whether or not a click here landed in it'
        )
        .toEqual([]);

      expect(
        unhit
          .filter((feature) => !(feature.layer in ALLOWED_CLICK_FAILURES))
          .map((feature) => `${feature.names[0]} (${feature.layer})`),
        `features on ${mapPath} that their own layer does not answer a hit test for, once it has drawn. Clicks on them ` +
          'can still open a popup through the fallback for a layer still drawing, which is how a layer that drew nothing ' +
          'passed this check on 9 November 2026 (#2707)'
      ).toEqual([]);
    });
  }
});
