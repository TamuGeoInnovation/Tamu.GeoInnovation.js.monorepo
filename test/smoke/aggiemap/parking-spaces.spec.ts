// connections.ts loads here without the Angular dependency graph, as in services.spec.ts, so the
// layer asked about below is the one the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * A parking-space map loads only the spaces it draws (#1897).
 *
 * Accessible Parking and Motorcycle Parking each draw one type of space from a service holding every
 * parking space on campus, about 45,000 points. Their symbology draws only their own types and has no
 * symbol for the rest, so every other space was downloaded and never drawn. On ArcGIS 5.1 in headless
 * Chromium the two maps took 96 to 231 and 174 seconds to finish drawing.
 *
 * Every layer loaded and returned features, so `maps.spec.ts` passed them. This asks the question
 * directly: does the layer hold exactly the spaces its symbology draws? The symbology is read from
 * the map probe, as the map is drawing it, and the service is asked how many spaces have those values.
 * So the check follows the service: if its owner starts drawing another type, a filter that leaves
 * that type out fails here rather than hiding it.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

// Both layers are on the transportation GIS host, which is the same for every environment (see
// getDefaultGisHosts() in connections.ts).
const MAPS = [
  {
    route: '/parking/accessible-parking',
    layerId: 'Accessible Parking Space',
    url: `${Connections.accessibleParkingUrl}/0`
  },
  {
    route: '/parking/motorcycle-parking',
    layerId: 'motorcycle-parking-space',
    url: `${Connections.motorcycleParkingUrl}/0`
  }
];

/** The part of a renderer's ArcGIS JSON this needs. */
interface RendererJson {
  type?: string;
  field1?: string;
  defaultSymbol?: unknown;
  uniqueValueInfos?: { value: string | number }[];
  uniqueValueGroups?: { classes?: { values?: (string | number)[][] }[] }[];
}

/**
 * The where clause selecting what a renderer draws: the values a unique-value renderer has a symbol
 * for, when it has no default symbol. Anything else draws every feature.
 */
function drawnWhere(renderer: RendererJson | null): string {
  if (renderer?.type !== 'uniqueValue' || !renderer.field1 || renderer.defaultSymbol) {
    return '1=1';
  }

  const values = new Set<string>([
    ...(renderer.uniqueValueInfos ?? []).map((info) => String(info.value)),
    ...(renderer.uniqueValueGroups ?? []).flatMap((group) =>
      (group.classes ?? []).flatMap((item) => (item.values ?? []).map((value) => String(value[0])))
    )
  ]);

  const quoted = [...values].sort().map((value) => `'${value.replace(/'/g, "''")}'`);

  return `${renderer.field1} IN (${quoted.join(', ')})`;
}

test.describe('parking-space maps', () => {
  for (const map of MAPS) {
    test(`${map.route} loads only the spaces it draws`, async ({ page, request }) => {
      await blockAnalytics(page);
      await page.goto(map.route, { waitUntil: 'domcontentloaded' });

      let found: { featureCount: number | null; renderer: RendererJson | null } | null = null;

      await expect
        .poll(
          async () => {
            found = await page.evaluate(
              async ({ name, id }) => {
                const probe = (
                  window as unknown as Record<
                    string,
                    {
                      ready?: boolean;
                      snapshot: () => Promise<{ layers: { id: string; featureCount: number | null }[] }>;
                      renderers: () => Record<string, unknown>;
                    }
                  >
                )[name];

                if (probe?.ready !== true) {
                  return null;
                }

                const layer = (await probe.snapshot()).layers.find((l) => l.id === id);

                return layer ? { featureCount: layer.featureCount, renderer: (probe.renderers()[id] ?? null) as never } : null;
              },
              { name: PROBE_GLOBAL, id: map.layerId }
            );

            return found !== null;
          },
          { message: `${map.route} never finished loading its ${map.layerId} layer`, timeout: 90_000, intervals: [1_000] }
        )
        .toBe(true);

      const { featureCount, renderer } = found as unknown as { featureCount: number | null; renderer: RendererJson | null };
      const where = drawnWhere(renderer);

      const response = await request.get(`${map.url}/query`, {
        params: { where, returnCountOnly: 'true', f: 'json' }
      });
      const drawn = ((await response.json()) as { count?: number }).count;

      test.info().annotations.push({
        type: 'spaces',
        description: `the layer holds ${featureCount}; its symbology draws ${drawn} (${where})`
      });

      expect(drawn, `the service could not count ${where}`).toBeGreaterThan(0);
      expect(featureCount, `${map.route}'s layer holds spaces its symbology does not draw (${where})`).toBe(drawn);
    });
  }
});
