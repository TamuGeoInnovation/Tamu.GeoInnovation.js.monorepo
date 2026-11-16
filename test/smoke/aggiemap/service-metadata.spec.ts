import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

import { retiredConnections } from './retired';
import { countQueryProblem, metadataProblems, serviceLayers } from './service-layers';
import type { LayerMetadata, MetadataProblem } from './service-layers';
import { gisHostFor, smokeBaseUrl } from './gis-hosts';

/**
 * A service describes itself consistently (#2511).
 *
 * Two faults on the baseball views, both after one republish, both invisible to every other check: portal
 * renderers keyed on fields the layer no longer has (#2500, `portal-renderers.spec.ts`) and a layer declaring
 * an `objectIdField` it does not have, so every query to it fails (#2510). Per layer of every hosted service:
 *
 * 1. `objectIdField` is one of the layer's `fields`;
 * 2. `displayField`, where one is set, is one of its `fields` (otherwise a popup title reads blank);
 * 3. `where=1=1&returnCountOnly=true`, the simplest question there is, is answered. A service can answer it with
 *    an error under a 200 status, so the body is read.
 *
 * No browser, so builder-gated maps are covered, which `map-layers.spec.ts` skips (#2467). Read-only. The
 * metadata comes from `service-layers.ts`, shared with `portal-renderers.spec.ts`.
 */

const BASE_URL = smokeBaseUrl();

/** The application chooses its GIS host from its own hostname (see `services.spec.ts`). */
const GIS_HOST = gisHostFor(BASE_URL);

/**
 * Known failures in this environment, by `<connection name>/<layer id>/<check>`, each with the issue that tracks it
 * (environments.json `allowedServiceMetadataFailures`). The check still runs and is annotated on the test, so it is
 * suppressed, not skipped.
 */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, { baseUrl: string; allowedServiceMetadataFailures?: Record<string, string> }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );

  return (
    Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === BASE_URL)?.allowedServiceMetadataFailures ?? {}
  );
}

const ALLOWED = allowedFailures();

const RETIRED = retiredConnections();

const connections = Connections(GIS_HOST) as unknown as Record<string, unknown>;
const services = Object.entries(connections).filter(
  (entry): entry is [string, string] => typeof entry[1] === 'string' && /^https?:\/\/.*\/(Feature|Map)Server(\/\d+)?$/.test(entry[1])
);

const layer = (overrides: Partial<LayerMetadata>): LayerMetadata => ({
  name: 'Gate/Road Closure',
  objectIdField: 'objectid',
  fields: [{ name: 'objectid' }, { name: 'name' }],
  ...overrides
});

test.describe(`a service describes itself consistently (${GIS_HOST})`, () => {
  test('objectIdField must be one of the layer fields (#2510)', () => {
    // The production layer: objectid_1 declared, objectid present.
    expect(metadataProblems(layer({ objectIdField: 'objectid_1' }))).toEqual([
      { check: 'objectIdField', message: 'objectIdField "objectid_1" is not one of its fields' }
    ]);
    expect(metadataProblems(layer({ objectIdField: 'OBJECTID', fields: [{ name: 'objectid' }] }))).toEqual([]);
    expect(metadataProblems(layer({ objectIdField: undefined }))).toEqual([]);
  });

  test('displayField, where set, must be one of the layer fields', () => {
    expect(metadataProblems(layer({ displayField: 'title' }))).toEqual([
      { check: 'displayField', message: 'displayField "title" is not one of its fields' }
    ]);
    expect(metadataProblems(layer({ displayField: 'Name' }))).toEqual([]);
    expect(metadataProblems(layer({ displayField: '' }))).toEqual([]);
  });

  test('a layer that is consistent, or that could not be read, has no problem', () => {
    expect(metadataProblems(layer({ displayField: 'name' }))).toEqual([]);
    expect(metadataProblems(null)).toEqual([]);
    expect(metadataProblems({ error: { code: 400 } })).toEqual([]);
  });

  test('the count query fails on an error body, a bad status or no count, and passes on a count', () => {
    const error = { code: 500, message: 'JSONObject["objectid_1"] not found.' };

    expect(countQueryProblem({ ok: true, status: 200, body: { error } })?.message).toContain('error 500: JSONObject["objectid_1"] not found.');
    expect(countQueryProblem({ ok: false, status: 503, body: null })?.message).toContain('HTTP 503');
    expect(countQueryProblem({ ok: true, status: 200, body: {} })?.message).toContain('no count');
    expect(countQueryProblem({ ok: true, status: 200, body: { count: 0 } })).toBeNull();
    expect(countQueryProblem({ ok: true, status: 200, body: { count: 3 } })).toBeNull();
  });

  test('connections.ts yields hosted services to check', () => {
    // Guards against an import or filter change silently reducing this to zero tests.
    expect(services.length, 'no service URLs were read from connections.ts').toBeGreaterThan(20);
  });

  for (const [name, url] of services) {
    test(`${name}: every layer's objectIdField and displayField are its fields, and it answers a count`, async ({ request }) => {
      const retiredIn = RETIRED.get(name);

      test.skip(retiredIn !== undefined, `used only by retired maps: ${retiredIn?.join(', ')}`);

      const layers = await serviceLayers(request, url);
      const found: Array<MetadataProblem & { key: string; layer: string }> = [];

      for (const entry of layers) {
        if (!entry.metadata || entry.metadata.error) {
          continue;
        }

        const label = `"${entry.metadata.name ?? entry.id}"`;
        const problems = metadataProblems(entry.metadata);
        const response = await request.get(`${entry.url}/query`, {
          params: { where: '1=1', returnCountOnly: 'true', f: 'json' },
          timeout: 30_000,
          failOnStatusCode: false
        });
        const count = countQueryProblem({
          ok: response.ok(),
          status: response.status(),
          body: await response.json().catch(() => null)
        });

        for (const problem of count ? [...problems, count] : problems) {
          found.push({ ...problem, key: `${name}/${entry.id}/${problem.check}`, layer: label });
        }
      }

      const unexplained = found.filter((problem) => !ALLOWED[problem.key]);

      for (const known of found.filter((problem) => ALLOWED[problem.key])) {
        test.info().annotations.push({
          type: 'known failure',
          description: `${known.key} ${known.layer}: ${known.message} (${ALLOWED[known.key]})`
        });
      }

      for (const key of Object.keys(ALLOWED).filter((entry) => entry.startsWith(`${name}/`))) {
        if (!found.some((problem) => problem.key === key)) {
          test.info().annotations.push({
            type: 'known failure now fixed',
            description: `${key} is clean; remove it from allowedServiceMetadataFailures (${ALLOWED[key]})`
          });
        }
      }

      expect(
        unexplained.map((problem) => `${problem.key} ${problem.layer}: ${problem.message}`),
        `${name}: ${url} describes itself inconsistently`
      ).toEqual([]);
    });
  }
});
