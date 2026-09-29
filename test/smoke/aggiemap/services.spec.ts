import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// connections.ts has no imports, so it loads here without the Angular dependency graph. This is the
// same function the app calls, so the URLs checked are exactly the URLs the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

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
