import { SELECTION_LAYER_ID } from './hit-order';
import { keepSelectionLayerOnTop } from './selection-layer';

import esri = __esri;

/**
 * The selection highlight stays the top-most layer however the map's layers load (#1805).
 *
 * A Football Tailgating link opened with its tent selected, and on some loads the highlight was drawn
 * under the tents: the map service and the event map add their layers at the same time, so a layer
 * could be added after the selection layer.
 */

/** The parts of a map this uses: its layers, which announce additions as Esri's collection does, and `add` and `reorder`. */
function fakeMap(ids: string[]) {
  const items: esri.Layer[] = ids.map((id) => ({ id }) as esri.Layer);
  const listeners: Array<(event: { added: esri.Layer[]; removed: esri.Layer[]; moved: esri.Layer[] }) => void> = [];
  const announce = (added: esri.Layer[], moved: esri.Layer[]) => listeners.forEach((l) => l({ added, removed: [], moved }));

  const map = {
    layers: {
      get length() {
        return items.length;
      },
      find: (test: (layer: esri.Layer) => boolean) => items.find(test),
      indexOf: (layer: esri.Layer) => items.indexOf(layer),
      on: (_name: string, listener: (typeof listeners)[number]) => {
        listeners.push(listener);
        return { remove: () => undefined };
      }
    },
    add: (id: string, index?: number) => {
      const layer = { id } as esri.Layer;
      items.splice(index ?? items.length, 0, layer);
      announce([layer], []);
    },
    reorder: (layer: esri.Layer, index: number) => {
      items.splice(items.indexOf(layer), 1);
      items.splice(index, 0, layer);
      announce([], [layer]);
    },
    order: () => items.map((layer) => layer.id)
  };

  keepSelectionLayerOnTop(map as unknown as esri.Map);

  return map;
}

describe('keeping the selection layer on top', () => {
  it('moves it back to the top when a layer is added after it', () => {
    const map = fakeMap(['buildings', SELECTION_LAYER_ID]);

    map.add('tailgating-zones');
    map.add('tailgating-tents');

    expect(map.order()).toEqual(['buildings', 'tailgating-zones', 'tailgating-tents', SELECTION_LAYER_ID]);
  });

  it('moves it back to the top when a layer is added above it at an index', () => {
    const map = fakeMap(['buildings', SELECTION_LAYER_ID]);

    map.add('parking', 2);

    expect(map.order()).toEqual(['buildings', 'parking', SELECTION_LAYER_ID]);
  });

  it('leaves alone a layer a caller moves above it on purpose', () => {
    const map = fakeMap(['buildings', 'sketch', SELECTION_LAYER_ID]);

    map.reorder(
      map.layers.find((layer) => layer.id === 'sketch'),
      2
    );

    expect(map.order()).toEqual(['buildings', SELECTION_LAYER_ID, 'sketch']);
  });

  it('does nothing on a map with no selection layer', () => {
    const map = fakeMap(['buildings']);

    map.add('tents');

    expect(map.order()).toEqual(['buildings', 'tents']);
  });
});
