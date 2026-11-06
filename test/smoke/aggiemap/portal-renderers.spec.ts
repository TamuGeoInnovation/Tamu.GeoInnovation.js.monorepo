import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
import {
  missingRendererFields,
  PortalItemData,
  portalItemDataUrl,
  rendererForLayer
} from '../../../libs/maps/esri/src/lib/services/map/portal-symbology';

import { retiredConnections } from './retired';
import { serviceLayers } from './service-layers';
import { gisHostFor, smokeBaseUrl } from './gis-hosts';

/**
 * Every portal renderer keys on fields its layer has (#2500).
 *
 * The map draws a layer with the renderer its portal item publishes, not its service's (#1497), and an item is
 * not republished when its service is. On 27 October 2026 the GIS team replaced the baseball views' schema:
 * the production item kept renderers keyed on `baseball`, `type` and `event` for layers that now have `type`
 * and `event` or neither, so no feature matched a class and three layers drew nothing, with no error. The layer
 * check in `map-layers.spec.ts` skips maps behind a builder (#2467), and this has no map to need: it reads each
 * hosted service's layers and its portal item, the way the application does, and compares.
 *
 * Needs no browser. Read-only.
 */

const BASE_URL = smokeBaseUrl();

/** The application chooses its GIS host from its own hostname (see `services.spec.ts`). */
const GIS_HOST = gisHostFor(BASE_URL);

/**
 * Layers whose portal renderer is known to be wrong in this environment, by `<connection name>/<layer id>`, each
 * with the issue that tracks it (environments.json `allowedPortalRendererFailures`). Still annotated on the
 * test, so it is suppressed, not hidden.
 */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, { baseUrl: string; allowedPortalRendererFailures?: Record<string, string> }> =
    JSON.parse(fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8'));

  return (
    Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === BASE_URL)
      ?.allowedPortalRendererFailures ?? {}
  );
}

const ALLOWED = allowedFailures();

const RETIRED = retiredConnections();

const connections = Connections(GIS_HOST) as unknown as Record<string, unknown>;
const services = Object.entries(connections).filter(
  (entry): entry is [string, string] => typeof entry[1] === 'string' && /^https?:\/\/.*\/(Feature|Map)Server(\/\d+)?$/.test(entry[1])
);

/** One layer's id and the problem with its portal renderer. */
interface RendererProblem {
  layerId: number;
  name: string;
  missing: string[];
}

/** The layers of `layers` whose portal renderer keys on a field the layer does not have. */
function rendererProblems(
  layers: Array<{ id: number; name: string; fields: string[] }>,
  item: PortalItemData | null
): RendererProblem[] {
  return layers.flatMap((layer) => {
    const missing = missingRendererFields(rendererForLayer(item, layer.id), layer.fields);

    return missing.length ? [{ layerId: layer.id, name: layer.name, missing }] : [];
  });
}

test.describe(`portal item renderers key on their layer's fields (${GIS_HOST})`, () => {
  test('a renderer keyed on a field the layer lacks is a problem, and one keyed on fields it has is not', () => {
    const item: PortalItemData = {
      layers: [
        { id: 0, layerDefinition: { drawingInfo: { renderer: { type: 'uniqueValue', field1: 'baseball' } } } },
        { id: 1, layerDefinition: { drawingInfo: { renderer: { type: 'uniqueValue', field1: 'type', field2: 'event' } } } },
        { id: 2, layerDefinition: { drawingInfo: { renderer: { type: 'simple' } } } }
      ]
    };
    const layers = [
      { id: 0, name: 'Lots', fields: ['objectid', 'type'] },
      { id: 1, name: 'Symbols', fields: ['objectid', 'TYPE', 'Event'] },
      { id: 2, name: 'Plain', fields: [] },
      { id: 3, name: 'No renderer in the item', fields: [] }
    ];

    expect(rendererProblems(layers, item)).toEqual([{ layerId: 0, name: 'Lots', missing: ['baseball'] }]);
  });

  test('connections.ts yields hosted services to check', () => {
    // Guards against an import or filter change silently reducing this to zero tests.
    expect(services.length, 'no service URLs were read from connections.ts').toBeGreaterThan(20);
  });

  for (const [name, url] of services) {
    test(`${name}: every portal renderer keys on fields its layer has`, async ({ request }) => {
      const retiredIn = RETIRED.get(name);

      test.skip(retiredIn !== undefined, `used only by retired maps: ${retiredIn?.join(', ')}`);

      const layers = await serviceLayers(request, url);
      const items = new Map<string, PortalItemData | null>();
      const problems: Array<RendererProblem & { key: string }> = [];

      for (const layer of layers) {
        const metadata = layer.metadata;
        const itemId = metadata?.serviceItemId;
        const dataUrl = itemId ? portalItemDataUrl(layer.url, itemId) : null;

        // A layer with no item, or one whose item cannot be read, keeps its service's symbology: nothing to compare.
        if (!metadata || !itemId || !dataUrl || metadata.error) {
          continue;
        }

        if (!items.has(itemId)) {
          const data = await (await request.get(dataUrl, { timeout: 30_000, failOnStatusCode: false })).json().catch(() => null);

          items.set(itemId, data?.error ? null : data);
        }

        const layerId = layer.id;
        const fields = ((metadata.fields ?? []) as Array<{ name: string }>).map((field) => field.name);

        problems.push(
          ...rendererProblems([{ id: layerId, name: metadata.name ?? String(layerId), fields }], items.get(itemId) ?? null).map(
            (problem) => ({ ...problem, key: `${name}/${layerId}` })
          )
        );
      }

      const unexplained = problems.filter((problem) => !ALLOWED[problem.key]);

      for (const known of problems.filter((problem) => ALLOWED[problem.key])) {
        test.info().annotations.push({
          type: 'known failure',
          description: `${known.key} ${known.name}: keys on ${known.missing.join(', ')} (${ALLOWED[known.key]})`
        });
      }

      for (const key of Object.keys(ALLOWED).filter((entry) => entry.startsWith(`${name}/`))) {
        if (!problems.some((problem) => problem.key === key)) {
          test.info().annotations.push({
            type: 'known failure now fixed',
            description: `${key} is clean; remove it from allowedPortalRendererFailures (${ALLOWED[key]})`
          });
        }
      }

      expect(
        unexplained.map((problem) => `${problem.key} "${problem.name}" keys on ${problem.missing.join(', ')}, which the layer does not have`),
        `${name}: ${url} has portal renderers that draw nothing`
      ).toEqual([]);
    });
  }
});
