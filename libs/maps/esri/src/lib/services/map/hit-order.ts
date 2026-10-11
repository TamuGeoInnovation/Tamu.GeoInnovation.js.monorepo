import esri = __esri;

/**
 * The id of the graphics layer that draws the highlight over a selected feature.
 */
export const SELECTION_LAYER_ID = 'selection-layer';

/**
 * Orders the graphics under a click for the popup, which opens for the first one that has a popup.
 *
 * As ArcGIS returns them, top-most first.
 */
export function orderHitsForPopup(graphics: esri.Graphic[]): esri.Graphic[] {
  return graphics;
}
