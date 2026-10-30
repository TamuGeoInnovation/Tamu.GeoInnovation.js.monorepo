import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// connections.ts has no imports, so it loads here without the Angular dependency graph. This is the
// same function the app calls, so the URLs checked are exactly the URLs the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

import { retiredConnections } from './retired';
import { gisHostFor, smokeBaseUrl } from './gis-hosts';

/**
 * Every GIS service the maps use is public and answering (#1118).
 *
 * The rest of the smoke suite finds a broken service only by loading a map that uses it, and only
 * for maps the environment lists. On #1110 the DC / Bush School services were republished under a
 * new path and the old one began answering "Token Required": it was noticed only because the
 * scheduled run happened to load that map on dev. A map that is hidden, builder-gated, or reached by
 * direct link only would not have been noticed at all.
 *
 * This asks each service directly, anonymously, as a visitor's browser would, so a republished,
 * unshared or stopped service is named outright rather than showing up as "a map didn't load".
 *
 * Needs no browser and no screenshots. Read-only.
 */

const BASE_URL = smokeBaseUrl();

/**
 * The app chooses its GIS host from its own hostname: containing "dev" means the development GIS
 * server (see getDefaultGisHosts() in connections.ts). Mirrored here so a run against dev checks the
 * services dev actually uses, and a run against production or localhost checks production's.
 */
const GIS_HOST = gisHostFor(BASE_URL);

interface EnvironmentSettings {
  baseUrl: string;
  allowedServiceFailures?: Record<string, string>;
}

/**
 * Services whose failure is already known in this environment, by connection name, each with the
 * issue that tracks it. Read from environments.json, the file the scheduled workflow and
 * run-local.sh also read, matched on the base URL.
 *
 * A known failure is still recorded in the test's annotations, so it is suppressed, not hidden.
 * Keep each entry tied to an issue and remove it when that issue is fixed.
 */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, EnvironmentSettings> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === BASE_URL);

  return match?.allowedServiceFailures ?? {};
}

const ALLOWED = allowedFailures();

const RETIRED = retiredConnections();

const connections = Connections(GIS_HOST) as unknown as Record<string, unknown>;
const services = Object.entries(connections).filter(
  (entry): entry is [string, string] => typeof entry[1] === 'string' && /^https?:\/\//.test(entry[1])
);

/** Why a service is unusable, or null if it answered properly. */
async function problemWith(request: import('@playwright/test').APIRequestContext, url: string): Promise<string | null> {
  const isArcgis = /\/rest\/services\//.test(url);
  const target = isArcgis ? `${url}${url.includes('?') ? '&' : '?'}f=json` : url;

  let response;
  try {
    response = await request.get(target, { timeout: 30_000, failOnStatusCode: false });
  } catch (error) {
    return `request failed: ${(error as Error).message.split('\n')[0]}`;
  }

  if (!isArcgis) {
    return response.ok() ? null : `HTTP ${response.status()}`;
  }

  // ArcGIS answers most errors with HTTP 200 and an `error` object, so the status alone says little.
  let body: { error?: { code?: number; message?: string } };
  try {
    body = await response.json();
  } catch {
    return `HTTP ${response.status()}, not JSON`;
  }

  if (body.error) {
    return `${body.error.code ?? 'error'} ${body.error.message ?? ''}`.trim();
  }

  return response.ok() ? null : `HTTP ${response.status()}`;
}

test.describe(`GIS services (${GIS_HOST})`, () => {
  test('connections.ts yields services to check', () => {
    // Guards against an import or filter change silently reducing this to zero tests.
    expect(services.length, 'no service URLs were read from connections.ts').toBeGreaterThan(20);
  });

  for (const [name, url] of services) {
    test(`${name} is public and answering`, async ({ request }) => {
      const retiredIn = RETIRED.get(name);

      test.skip(retiredIn !== undefined, `used only by retired maps: ${retiredIn?.join(', ')}`);

      const problem = await problemWith(request, url);
      const known = ALLOWED[name];

      if (known) {
        test.info().annotations.push({
          type: problem ? 'known failure' : 'known failure now answering',
          description: problem
            ? `${url}: ${problem} (${known})`
            : `${url} answers again; remove it from allowedServiceFailures (${known})`
        });
        return;
      }

      expect(problem, `${name}: ${url} answered "${problem}"`).toBeNull();
    });
  }
});

/**
 * Every layer can hand over every feature it holds (#2101).
 *
 * A layer that refuses a query fails `map-layers.spec.ts`. A layer that answers short does not: a service
 * caps each answer at its `maxRecordCount`, so a layer holding more than that is drawn in full only if a
 * client can page past the cap. On 22 October Accessible Building Entrances held 1,524 features, capped at
 * 1,000, and answered `Pagination is not supported.` - so no client could have had the other 524, and with
 * no error from the first page nothing would have said so.
 *
 * So this asks the service, not a map: its total, its cap, and - only where the total is over the cap - the
 * first record past it. The same answer on every run, with no layer view, extent or timing involved.
 * Comparing a layer view's count with the service's was tried and does not work: a view holds what the
 * current level of detail needs, and line layers are clipped and tiled.
 */

/** What a layer says it holds, and what it answered when asked past its cap. */
interface LayerHoldings {
  total: number;
  maxRecordCount: number;
  /** The answer to the first record past the cap, or `null` where the total is within it and nothing was asked. */
  pastCap: { error?: { message?: string }; features?: unknown[] } | null;
}

/** Why a layer cannot hand over everything it holds, or null if it can. */
function completenessProblem({ total, maxRecordCount, pastCap }: LayerHoldings): string | null {
  if (total <= maxRecordCount) {
    return null;
  }

  if (!pastCap) {
    return `holds ${total} features, more than its maxRecordCount of ${maxRecordCount}, and was not asked past it`;
  }

  if (pastCap.error) {
    return `holds ${total} features, more than its maxRecordCount of ${maxRecordCount}, and refused the records past it: ${pastCap.error.message ?? 'error'}`;
  }

  if (!pastCap.features?.length) {
    return `holds ${total} features, more than its maxRecordCount of ${maxRecordCount}, and answered nothing past record ${maxRecordCount}`;
  }

  return null;
}

/** The layer endpoints a connection stands for: itself when it names a layer, otherwise each feature layer of its service. */
async function layersOf(request: import('@playwright/test').APIRequestContext, url: string): Promise<string[]> {
  if (/\/(MapServer|FeatureServer)\/\d+$/.test(url)) {
    return [url];
  }

  if (!/\/(MapServer|FeatureServer)$/.test(url)) {
    return [];
  }

  const root = await (await request.get(`${url}?f=json`, { timeout: 30_000 })).json();

  return ((root.layers ?? []) as Array<{ id: number; type?: string; subLayerIds?: number[] | null }>)
    .filter((layer) => !layer.subLayerIds?.length && (layer.type ?? 'Feature Layer') === 'Feature Layer')
    .map((layer) => `${url}/${layer.id}`);
}

/** Asks `layer` for its total, its cap and, where the total is over the cap, the first record past it. */
async function holdingsOf(request: import('@playwright/test').APIRequestContext, layer: string): Promise<LayerHoldings | string> {
  const metadata = await (await request.get(`${layer}?f=json`, { timeout: 30_000 })).json();

  if (metadata.error) {
    return `${metadata.error.code ?? 'error'} ${metadata.error.message ?? ''}`.trim();
  }

  // Tables and raster layers answer no feature query; there is nothing to page.
  if (metadata.type !== 'Feature Layer') {
    return `not a feature layer (${metadata.type ?? 'no type'})`;
  }

  const count = await (
    await request.get(`${layer}/query`, { params: { where: '1=1', returnCountOnly: 'true', f: 'json' }, timeout: 30_000 })
  ).json();

  if (count.error || typeof count.count !== 'number') {
    return `its features could not be counted: ${count.error?.message ?? 'no count'}`;
  }

  const total = count.count as number;
  const maxRecordCount = (metadata.maxRecordCount as number | undefined) ?? 1000;

  if (total <= maxRecordCount) {
    return { total, maxRecordCount, pastCap: null };
  }

  // Order by the layer's object id when it names one, so the page is stable. Several name none (the basemap's road
  // centerlines, and Accessible Building Entrances, whose only OID field is its attachments'), and a guessed
  // OBJECTID there is refused as "Invalid or missing input parameters." - a fault of the question, not the layer.
  // Those are asked with the server's own default fields and order.
  const objectIdField = metadata.objectIdField as string | undefined;
  const pastCap = await (
    await request.get(`${layer}/query`, {
      params: {
        where: '1=1',
        ...(objectIdField ? { outFields: objectIdField, orderByFields: objectIdField } : {}),
        returnGeometry: 'false',
        resultOffset: String(maxRecordCount),
        resultRecordCount: '1',
        f: 'json'
      },
      timeout: 30_000
    })
  ).json();

  return { total, maxRecordCount, pastCap };
}

test.describe(`GIS layers hand over every feature they hold (${GIS_HOST})`, () => {
  test('a layer over its cap that refuses the records past it is a problem', () => {
    expect(
      completenessProblem({ total: 1524, maxRecordCount: 1000, pastCap: { error: { message: 'Pagination is not supported.' } } })
    ).toBe('holds 1524 features, more than its maxRecordCount of 1000, and refused the records past it: Pagination is not supported.');
  });

  test('a layer over its cap that answers nothing past it is a problem', () => {
    expect(completenessProblem({ total: 1524, maxRecordCount: 1000, pastCap: { features: [] } })).toBe(
      'holds 1524 features, more than its maxRecordCount of 1000, and answered nothing past record 1000'
    );
  });

  test('a layer within its cap, or one that pages past it, is not', () => {
    expect(completenessProblem({ total: 381, maxRecordCount: 1000, pastCap: null })).toBeNull();
    expect(completenessProblem({ total: 1524, maxRecordCount: 1000, pastCap: { features: [{}] } })).toBeNull();
  });

  for (const [name, url] of services) {
    test(`${name} hands over every feature it holds`, async ({ request }) => {
      const retiredIn = RETIRED.get(name);

      test.skip(retiredIn !== undefined, `used only by retired maps: ${retiredIn?.join(', ')}`);
      // A service already known not to answer cannot be asked what it holds; the test above records it.
      test.skip(ALLOWED[name] !== undefined, `a known failure: ${ALLOWED[name]}`);

      const layers = await layersOf(request, url);

      test.skip(layers.length === 0, `${url} is not a feature service`);

      const problems: string[] = [];

      // Asked together: one at a time, the basemap's 66 layers took about 50 seconds.
      const allHoldings = await Promise.all(layers.map((layer) => holdingsOf(request, layer)));

      for (const [i, layer] of layers.entries()) {
        const holdings = allHoldings[i];

        if (typeof holdings === 'string') {
          test.info().annotations.push({ type: 'not checked', description: `${layer}: ${holdings}` });
          console.log(`NOT CHECKED ${name} ${layer}: ${holdings}`);
          continue;
        }

        const problem = completenessProblem(holdings);
        const paged = holdings.pastCap === null ? 'within its cap' : problem ? 'paging past the cap failed' : 'paged past the cap';

        // The numbers are the useful output even when nothing fails: they show which layers are near their cap.
        const line = `${layer}: ${holdings.total} of maxRecordCount ${holdings.maxRecordCount}, ${paged}`;

        test.info().annotations.push({ type: 'holdings', description: line });
        console.log(`HOLDINGS ${name} ${line}`);

        if (problem) {
          problems.push(`${layer} ${problem}`);
        }
      }

      expect(problems, `${name}: layers that cannot hand over every feature they hold`).toEqual([]);
    });
  }
});

/**
 * The campus basemap's own services (#1695).
 *
 * Everything above is read from `connections.ts`. The basemap gallery's services are not in that
 * file - they live in `basemaps.definition.ts`, because a basemap is declared as Esri
 * `BaseMapProperties` rather than as a connection - so until now the one service every AggieMap view
 * draws under its layers was the only service in the application nothing here asked about. A
 * republished or unshared campus basemap would have shown up as "a map looks blank", if at all.
 *
 * That file imports from `@tamu-gisc/maps/esri`, so it is read as text rather than imported: this
 * file deliberately pulls in nothing from the Angular graph.
 */
const BASEMAP_DEFINITION = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'libs', 'maps', 'feature', 'basemap', 'src', 'lib', 'shared', 'basemaps.definition.ts'),
  'utf8'
);

/**
 * The current campus raster basemap's URL. The definitions name it through this constant rather than
 * writing it out (#1700), so it is read from where it is declared.
 */
const CAMPUS_BASEMAP_URL = fs
  .readFileSync(
    path.join(__dirname, '..', '..', '..', 'libs', 'common', 'datasets', 'geographic', 'src', 'lib', 'campus', 'campus-basemap.ts'),
    'utf8'
  )
  .match(/TAMU_CAMPUS_BASEMAP_URL = '([^']+)'/)?.[1];

/** Every ArcGIS service URL the basemap definitions name, by the constant that names it. */
function basemapServices(): Array<[string, string]> {
  const found: Array<[string, string]> = [];

  // A basemap is declared as `BaseMapProperties`, or as `BaseMapProperties & { id: string }` when it is typed with its id.
  for (const match of BASEMAP_DEFINITION.matchAll(/export const (\w+): BaseMapProperties(?: & \{[^}]*\})? = \{([\s\S]*?)\n\};/g)) {
    const [, constant, block] = match;

    for (const url of block.matchAll(/https:\/\/[^'"`\s]+\/arcgis\/rest\/services\/[^'"`\s]+/g)) {
      found.push([constant, url[0]]);
    }

    if (CAMPUS_BASEMAP_URL && block.includes('TAMU_CAMPUS_BASEMAP_URL')) {
      found.push([constant, CAMPUS_BASEMAP_URL]);
    }
  }

  return found;
}

/** The service root, without `/info/thumbnail` or any other sub-resource. */
function serviceRoot(url: string): string {
  const match = url.match(/^(.*\/(?:MapServer|VectorTileServer|FeatureServer))(\/|$)/);

  return match ? match[1] : url;
}

const basemaps = basemapServices();

/**
 * One entry per service, not per URL: a basemap names its service twice, once for the tiles and once
 * for the gallery thumbnail, and checking the same root twice gives two tests of the same name.
 */
const basemapRoots = [...new Map(basemaps.map(([constant, url]) => [serviceRoot(url), constant])).entries()];

/**
 * The pictures the basemap panel shows, which ship with the application (#1730). They used to be
 * named on the services themselves and were checked there.
 */
const basemapThumbnails = [...new Set([...BASEMAP_DEFINITION.matchAll(/'(\/assets\/images\/basemap_thumbnails\/[^']+)'/g)].map((match) => match[1]))];

test.describe('campus basemap services', () => {
  test('the basemap definitions yield services to check', () => {
    // As above: guards against the regex or the file's shape changing and emptying this quietly.
    expect(basemapRoots.length, 'no service URLs were read from basemaps.definition.ts').toBeGreaterThan(1);
    expect(basemapThumbnails.length, 'no thumbnails were read from basemaps.definition.ts').toBeGreaterThan(1);
  });

  for (const [root, constant] of basemapRoots) {
    test(`${constant}: ${root.split('/services/')[1]} is public and answering`, async ({ request }) => {
      // Both campus basemaps are named on `gis.tamu.edu` outright, not through the environment's GIS
      // host, so this asks the same question on every environment. The vector cache is shown only
      // where `isTesting` reports true (#1229), but the service itself is public either way.
      const problem = await problemWith(request, root);

      expect(problem, `${constant}: ${root} answered "${problem}"`).toBeNull();
    });
  }

  for (const thumbnail of basemapThumbnails) {
    test(`${thumbnail} is served with the application`, async ({ request, baseURL }) => {
      // The basemap panel's pictures ship with the build (#1730). Broken, one leaves a blank tile in
      // the panel that nobody would report.
      const response = await request.get(`${baseURL}${thumbnail}`, { timeout: 30_000, failOnStatusCode: false });

      expect(response.status(), `${thumbnail} did not return 200`).toBe(200);
      expect(response.headers()['content-type'] ?? '', `${thumbnail} is not an image`).toContain('image/');
    });
  }

  /**
   * `AGGIEMAP_BASEMAP_MAX_SCALE` is as deep as the campus basemaps production offers allow, and no deeper (#1577,
   * #1695, #2515).
   *
   * Every AggieMap view stops at that scale, and a view allowed deeper than a basemap's cache draws white under its
   * layers. Production offers the vector basemap, which it opens on, and the raster one (#2515). The vector cache
   * goes two levels deeper than the raster one, so the limit is the raster cache's: deeper, and a visitor who
   * switches to raster zooms into white.
   *
   * Asked of the services rather than of a second copy of the number, so a republished cache that is deeper or
   * shallower is caught the day it is pointed at, not the first time somebody zooms in. This used to ask the raster
   * service alone, which would have kept passing with the vector basemap as the default, about the wrong basemap.
   */
  test('the view limit is no deeper than any campus basemap production offers', async ({ request }) => {
    const declared = BASEMAP_DEFINITION.match(/AGGIEMAP_BASEMAP_MAX_SCALE = ([\d.]+)/);

    expect(declared, 'AGGIEMAP_BASEMAP_MAX_SCALE was not found in basemaps.definition.ts').not.toBeNull();

    const limit = Number(declared?.[1]);
    const offered = ['AggiemapVectorBasemap', 'AggiemapRasterBasemap'];
    const scales: Array<[string, number]> = [];

    for (const constant of offered) {
      // The first service a basemap names is its tiles. Looked up in the full list, not `basemapRoots`: that keeps one
      // name per service, and the vector basemap names the raster basemap's service too, for its construction layer.
      const url = basemaps.find(([name]) => name === constant)?.[1];
      const root = url === undefined ? undefined : serviceRoot(url);

      expect(root, `${constant}'s service was not found in basemaps.definition.ts`).toBeDefined();

      const response = await request.get(`${root}?f=json`, { timeout: 30_000, failOnStatusCode: false });
      const service: { maxScale?: number } = await response.json();

      expect(service.maxScale, `${root} did not report a maxScale`).toBeGreaterThan(0);
      scales.push([root as string, service.maxScale as number]);
    }

    // The shallowest cache sets the limit. The constant sits just below that level's scale on purpose: at exactly
    // level 21's scale the view stopped a level early. A whole scale level is a factor of two, so anything within ten
    // per cent is the same level, and a cache one level deeper or shallower is not.
    const [shallowestRoot, shallowest] = scales.reduce((a, b) => (b[1] > a[1] ? b : a));

    expect(
      Math.abs(limit - shallowest) / shallowest,
      `AGGIEMAP_BASEMAP_MAX_SCALE is ${limit}, but the shallowest campus basemap production offers, ${shallowestRoot}, ` +
        `caches down to ${shallowest} (${scales.map(([root, scale]) => `${root}: ${scale}`).join('; ')}). Set the ` +
        `constant to that cache's depth, or the view will allow levels a basemap has no tiles for.`
    ).toBeLessThan(0.1);
  });
});
