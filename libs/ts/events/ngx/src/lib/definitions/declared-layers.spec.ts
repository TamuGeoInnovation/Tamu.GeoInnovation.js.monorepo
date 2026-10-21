/**
 * @vitest-environment-options {"url": "https://aggiemap.tamu.edu/"}
 */
import { LayerSource } from '@tamu-gisc/common/types';

import { EventDefinitions } from './all.definitions';
import { AggiemapCustomMapConfiguration } from '../interfaces/special-event.interface';

/**
 * The layers each map's definition says its Layers list shows, for the smoke suite (#1986).
 *
 * `test/smoke/aggiemap/map-layers.spec.ts` checks every listed layer reaches the sidebar of the deployed
 * map. It cannot import the definitions itself (`global-setup.ts` says why), so it reads this file's
 * snapshot, `declared-layers.generated.json`, which is committed beside it. The snapshot is the
 * definitions' own answer, so it stays right without anyone editing it: a definition that changes what
 * it lists fails this test until the snapshot is rewritten with `nx test ts-events-ngx -u`.
 *
 * A layer counts when the map draws it (its id is in `references`, which is what `EventService` loads)
 * and it is listed (`listMode` is not `'hide'`). Layers are named by id, because most take their title
 * from their service when they load: the smoke suite finds each on the map by id, then looks for the
 * title it ended up with. A layer an option can hide (`propOverrides.visible: false`, which
 * `SidebarReferenceComponent` leaves out of the list) or relist depends on a choice, so it is left out
 * rather than guessed at. A map whose sidebar has no Layers list (`hideLayerToggle`, `hideSidebar`)
 * lists nothing.
 *
 * A map with a version published only on the development GIS server (`developmentSources`, #2001) also
 * lists that version's layers, as `developmentLayers`: what it shows where that server is read.
 */
interface DeclaredMap {
  /** Whether the map has a Layers list at all. */
  layerList: boolean;
  /** The ids of the layers the Layers list must show, in definition order. */
  layers: string[];
  /** The same, where the development GIS server is read, for a map with a development version. */
  developmentLayers?: string[];
}

function declared(definition: AggiemapCustomMapConfiguration): DeclaredMap {
  const layers = listed(definition, definition.sources ?? []);
  const development = definition.developmentSources;

  return development ? { ...layers, developmentLayers: listed(definition, development).layers } : layers;
}

function listed(definition: AggiemapCustomMapConfiguration, sources: LayerSource[]): DeclaredMap {
  const configuration = definition.configuration;
  const layerList = !(configuration?.hideLayerToggle || configuration?.hideSidebar);
  const drawn = new Set(Object.values(definition.references ?? {}));
  const conditional = new Set(
    (definition.options ?? []).flatMap((option) =>
      (option.effects.layers ?? [])
        .filter((effect) =>
          (effect.conversions ?? []).some(
            (conversion) =>
              conversion.propOverrides !== undefined &&
              ('visible' in conversion.propOverrides || 'listMode' in conversion.propOverrides)
          )
        )
        .map((effect) => effect.layerId)
    )
  );

  const layers = sources
    .filter((source: LayerSource) => drawn.has(source.id) && !conditional.has(source.id))
    .filter((source) => source.listMode !== 'hide')
    .map((source) => source.id);

  return { layerList, layers: layerList ? [...new Set(layers)] : [] };
}

describe('declared layers (#1986)', () => {
  it('match the snapshot the smoke suite reads', async () => {
    const byMap: Record<string, DeclaredMap> = {};

    for (const definition of EventDefinitions) {
      const id = definition.configuration?.id;

      if (id) {
        byMap[id] = declared(definition);
      }
    }

    const sorted = Object.fromEntries(Object.entries(byMap).sort(([a], [b]) => a.localeCompare(b)));

    await expect(`${JSON.stringify(sorted, null, 2)}\n`).toMatchFileSnapshot(
      '../../../../../../../test/smoke/aggiemap/declared-layers.generated.json'
    );
  });
});
