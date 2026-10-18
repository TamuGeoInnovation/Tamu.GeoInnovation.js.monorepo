import esri = __esri;

import { SELECTION_LAYER_ID } from './hit-order';

/**
 * Keeps the selection highlight drawn above every layer added to `map` after it (#1805).
 *
 * A map's layers are added by more than one caller at once: the map service adds the main map's set
 * while an event map adds its own, each one at a time as it is made, so the order they end up in
 * depends on which finishes first. A layer added after the selection layer drew over the highlight,
 * and a Football Tailgating link opened with its tent selected but not visibly highlighted on some
 * loads. Whenever a layer is added, the selection layer is moved back to the top.
 *
 * Only additions move it. A caller that deliberately reorders a layer above it afterwards, as the
 * draw tools do with their sketch layer, keeps that order.
 */
export function keepSelectionLayerOnTop(map: esri.Map): IHandle {
  return map.layers.on('change', (event) => {
    if (event.added.length === 0) {
      return;
    }

    const top = map.layers.length - 1;
    const selection = map.layers.find((layer) => layer.id === SELECTION_LAYER_ID);

    if (selection && map.layers.indexOf(selection) !== top) {
      map.reorder(selection, top);
    }
  });
}
