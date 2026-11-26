/**
 * @vitest-environment-options {"url": "https://aggiemap.tamu.edu/"}
 */
import { LayerSource } from '@tamu-gisc/common/types';
import { DEVELOPMENT_ONLY_LAYER_SOURCES, factory } from '@tamu-gisc/aggiemap/ngx/common';

import { EventDefinitions } from './all.definitions';
import { AggiemapCustomMapConfiguration } from '../interfaces/special-event.interface';

/**
 * The production layers every event map draws, for `scripts/event-map-monitors.mjs` (#3674).
 *
 * Every event map depends on hosted layers, and each needs an uptime monitor. Until now somebody had to remember to add
 * one whenever a map was made (#497). The definitions already say which layers a map draws, so the list is read from
 * them, not kept by hand.
 *
 * The script can't import the definitions (they're TypeScript, with Angular inside), so this spec writes their answer
 * to `scripts/event-map-layers.generated.json`, committed beside the script. This is how `declared-layers.spec.ts`
 * serves the smoke suite. A definition that changes a layer fails this test until the file is rewritten with
 * `nx test ts-events-ngx -u`, so the file can't go stale unnoticed.
 *
 * **The URLs are production's**, because this page's address is production's: `Connections` resolves them here
 * exactly as it does for a visitor. That matters because production is not development with the host swapped. Men's
 * basketball is a different host and a different service name on each.
 *
 * **Left out, because a monitor would alert on something that is correctly absent:**
 * - every map marked `developmentOnly`;
 * - every map whose `discover.status` is `retired`: the event is over, and `RetiredEventGuard` never shows its map;
 * - any layer whose service is in `DEVELOPMENT_ONLY_LAYER_SOURCES`;
 * - `developmentSources`, which only a development host draws.
 *
 * Each skip is listed in the file with its reason.
 */

interface MonitoredLayer {
  /** The layer's id in the map's definition. */
  id: string;
  /** The production URL it is drawn from. */
  url: string;
}

interface EventMapLayers {
  maps: Record<string, { name: string; layers: MonitoredLayer[] }>;
  skipped: {
    developmentOnlyMaps: Array<{ map: string; reason: string }>;
    retiredMaps: Array<{ map: string; reason: string }>;
    developmentOnlyLayers: Array<{ map: string; layer: string; reason: string }>;
  };
}

/** The URLs of the main map's layers that a production build leaves out, with why. */
function developmentOnlyUrls(): Map<string, string> {
  const { Definitions } = factory({ environment: 'prod' });

  return new Map(
    DEVELOPMENT_ONLY_LAYER_SOURCES.flatMap(({ definition, reason }) => {
      const url = (Definitions[definition] as { url?: string } | undefined)?.url;
      return url ? [[url, reason] as [string, string]] : [];
    })
  );
}

/** Every layer with a URL that a map draws: the sources its `references` name, with a drawn group's children. */
function drawnLayers(definition: AggiemapCustomMapConfiguration): MonitoredLayer[] {
  const drawn = new Set(Object.values(definition.references ?? {}));
  const withUrl = (source: LayerSource): MonitoredLayer[] => [
    ...('url' in source && source.url ? [{ id: source.id, url: String(source.url) }] : []),
    ...((source as { sources?: LayerSource[] }).sources ?? []).flatMap(withUrl)
  ];

  const layers = (definition.sources ?? []).filter((source) => drawn.has(source.id)).flatMap(withUrl);

  // One row per URL a map reads, the first id that reads it named.
  return [...new Map(layers.map((layer) => [layer.url, layer])).values()];
}

function eventMapLayers(definitions: AggiemapCustomMapConfiguration[]): EventMapLayers {
  const excluded = developmentOnlyUrls();
  const result: EventMapLayers = {
    maps: {},
    skipped: { developmentOnlyMaps: [], retiredMaps: [], developmentOnlyLayers: [] }
  };

  for (const definition of definitions) {
    const id = definition.configuration?.id;

    if (!id) {
      continue;
    }

    if (definition.developmentOnly) {
      result.skipped.developmentOnlyMaps.push({ map: id, reason: definition.developmentOnly });
      continue;
    }

    // An ended event: `RetiredEventGuard` sends a visitor to its `ended` page, never to the map (#1098), and its
    // services are often stopped. A monitor would be red from the day it was made.
    if (definition.discover?.status === 'retired') {
      result.skipped.retiredMaps.push({ map: id, reason: 'retired: the event is over, and its map is never shown (#1098)' });
      continue;
    }

    const layers: MonitoredLayer[] = [];

    for (const layer of drawnLayers(definition)) {
      const reason = excluded.get(layer.url);

      if (reason) {
        result.skipped.developmentOnlyLayers.push({ map: id, layer: layer.id, reason });
      } else {
        layers.push(layer);
      }
    }

    if (layers.length) {
      result.maps[id] = { name: definition.configuration?.name ?? id, layers };
    }
  }

  result.maps = Object.fromEntries(Object.entries(result.maps).sort(([a], [b]) => a.localeCompare(b)));

  return result;
}

describe('event map monitors (#3674)', () => {
  const generated = eventMapLayers(EventDefinitions);

  // Verified live on production on 25 November 2026 (#497): these are the two maps whose answer is already known.
  it("lists men's basketball's three production layers, on the production host and service", () => {
    expect(generated.maps['mens-basketball'].layers.map((layer) => layer.url)).toEqual([
      'https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/0',
      'https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/1',
      'https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/2'
    ]);
  });

  it("lists women's basketball's two production layers, on Transportation's host", () => {
    expect(generated.maps['womens-basketball'].layers.map((layer) => layer.url)).toEqual([
      'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer/0',
      'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer/1'
    ]);
  });

  it('reads no development host', () => {
    const urls = Object.values(generated.maps).flatMap((map) => map.layers.map((layer) => layer.url));

    expect(urls.filter((url) => new URL(url).hostname.includes('dev'))).toEqual([]);
  });

  it('leaves out every development-only map, saying why', () => {
    const developmentOnly = EventDefinitions.filter((definition) => definition.developmentOnly).map(
      (definition) => definition.configuration?.id
    );

    expect(generated.skipped.developmentOnlyMaps.map((skip) => skip.map)).toEqual(developmentOnly);
    expect(developmentOnly.filter((id) => id && id in generated.maps)).toEqual([]);
  });

  // Savannah Bananas is one of four retired maps whose services are stopped on production: listing them made eleven
  // monitors that would be red from the day they were made (a44).
  it('leaves out a retired map, saying why', () => {
    expect(generated.maps['savannah-bananas-parking']).toBeUndefined();
    expect(generated.skipped.retiredMaps.map((skip) => skip.map)).toContain('savannah-bananas-parking');
  });

  it('leaves out every retired map and nothing else', () => {
    const current = EventDefinitions.filter(
      (definition) => !definition.developmentOnly && definition.discover?.status !== 'retired'
    )
      .filter((definition) => drawnLayers(definition).length)
      .map((definition) => definition.configuration?.id)
      .sort();

    expect(Object.keys(generated.maps).sort()).toEqual(current);
    expect(current).toContain('womens-basketball');
  });

  it('match the file the script reads', async () => {
    await expect(`${JSON.stringify(generated, null, 2)}\n`).toMatchFileSnapshot(
      '../../../../../../../scripts/event-map-layers.generated.json'
    );
  });
});
