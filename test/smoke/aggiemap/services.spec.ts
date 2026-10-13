import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// connections.ts has no imports, so it loads here without the Angular dependency graph. This is the
// same function the app calls, so the URLs checked are exactly the URLs the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

import { retiredConnections } from './retired';

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

const BASE_URL = process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu';

/**
 * The app chooses its GIS host from its own hostname: containing "dev" means the development GIS
 * server (see getDefaultGisHosts() in connections.ts). Mirrored here so a run against dev checks the
 * services dev actually uses, and a run against production or localhost checks production's.
 */
const GIS_HOST = new URL(BASE_URL).hostname.includes('dev') ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';

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
  const normalised = BASE_URL.replace(/\/$/, '');
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === normalised);

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

/** Every ArcGIS service URL the basemap definitions name, by the constant that names it. */
function basemapServices(): Array<[string, string]> {
  const found: Array<[string, string]> = [];

  for (const match of BASEMAP_DEFINITION.matchAll(/export const (\w+): BaseMapProperties = \{([\s\S]*?)\n\};/g)) {
    const [, constant, block] = match;

    for (const url of block.matchAll(/https:\/\/[^'"`\s]+\/arcgis\/rest\/services\/[^'"`\s]+/g)) {
      found.push([constant, url[0]]);
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
   * `AGGIEMAP_BASEMAP_MAX_SCALE` still matches the basemap it is derived from (#1577, #1695).
   *
   * Every AggieMap view stops at that scale because the raster cache has no tiles past level 21, and
   * a view allowed deeper draws white under its layers. The number is hard-coded, with a comment
   * asking whoever republishes the basemap to raise it to the new service's `maxScale` - and nothing
   * made that happen. This change republished the basemap and the number was right by luck: the
   * October 2026 cache stops at the same level the June one did.
   *
   * Asked of the service rather than of a second copy of the number, so a deeper or shallower cache
   * is caught the day it is pointed at, not the first time somebody zooms in.
   */
  test('the view limit matches the raster basemap cache', async ({ request }) => {
    const declared = BASEMAP_DEFINITION.match(/AGGIEMAP_BASEMAP_MAX_SCALE = ([\d.]+)/);

    expect(declared, 'AGGIEMAP_BASEMAP_MAX_SCALE was not found in basemaps.definition.ts').not.toBeNull();

    const raster = basemapRoots.find(([, constant]) => constant === 'AggiemapRasterBasemap');

    expect(raster, 'the raster basemap service was not found in basemaps.definition.ts').toBeDefined();

    const response = await request.get(`${raster?.[0]}?f=json`, { timeout: 30_000, failOnStatusCode: false });
    const service: { maxScale?: number } = await response.json();

    expect(service.maxScale, `${raster?.[0]} did not report a maxScale`).toBeGreaterThan(0);

    // The constant sits just below the service's own value on purpose: at exactly level 21's scale
    // the view stopped a level early. A whole scale level is a factor of two, so anything within ten
    // per cent is the same level, and a republished cache one level deeper is not.
    const limit = Number(declared?.[1]);

    expect(
      Math.abs(limit - (service.maxScale as number)) / (service.maxScale as number),
      `AGGIEMAP_BASEMAP_MAX_SCALE is ${limit}, but ${raster?.[0]} caches down to ${service.maxScale}. ` +
        `Raise or lower the constant to match the cache, or the view will allow levels the basemap ` +
        `has no tiles for.`
    ).toBeLessThan(0.1);
  });
});
