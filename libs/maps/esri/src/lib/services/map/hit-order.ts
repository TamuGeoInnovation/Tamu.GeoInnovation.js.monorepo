import esri = __esri;

/**
 * The id of the graphics layer that draws the highlight over a selected feature.
 */
export const SELECTION_LAYER_ID = 'selection-layer';

/**
 * Orders the graphics under a click for the popup, which opens for the first one that has a popup.
 *
 * ArcGIS returns them top-most first. The selection highlight is drawn over the feature it highlights
 * and over anything inside that feature, so it is moved behind whatever else was clicked: a click on a
 * tent inside a highlighted Tailgating zone belongs to the tent, not to the highlight (#1614). When
 * the highlight is all there is under the click, it still gets the popup.
 */
export function orderHitsForPopup(graphics: esri.Graphic[]): esri.Graphic[] {
  const isHighlight = (graphic: esri.Graphic) => graphic.layer?.id === SELECTION_LAYER_ID;

  return [...graphics.filter((graphic) => !isHighlight(graphic)), ...graphics.filter(isHighlight)];
}
