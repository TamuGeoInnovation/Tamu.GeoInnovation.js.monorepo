import esri = __esri;

/**
 * How far from a click, in screen pixels, a point or line feature still counts as under it. A hit test
 * reaches a marker by its symbol; a query has only the geometry, so it is given this much room instead.
 */
export const CLICK_TOLERANCE_PIXELS = 8;

/**
 * The features under a click, from the layers a hit test cannot see into yet (#2707).
 *
 * `view.hitTest` finds only what a layer view has already drawn. Until the buildings layer view holds the
 * graphics under the point, which on a fresh load is well after the page looks ready, it answers with
 * nothing and the click opened no popup: 0 of 20 clicks on dev once the framing had settled. The trip
 * planner never had the fault because it asks the layer itself (`featuresIntersectingPoint`); this does
 * the same for the popup.
 *
 * Only layers that open a popup are asked, top-most first as a hit test answers, and only those whose
 * layer view is still being made, is still drawing, or has drawn without every feature in view: once every
 * one has drawn all of them, an empty hit test is the truth, so a click on bare ground on a drawn map asks
 * nothing. A layer whose query fails is left out rather than losing the others' features.
 *
 * **Drawn is not complete** (#2785). A service can answer a tile query with an error in a 200 response, and
 * the layer view then draws without that tile's features and does not ask again: settled, and missing a square
 * of buildings for the rest of the visit, so the hit test there finds nothing. `hasAllFeaturesInView` is false
 * when "some queries failed to execute" (ArcGIS 4.29 and later), and stays false, so such a layer is asked on
 * every click, the whole layer once per click. Measured on production on 9 November 2026, it named exactly the
 * layers that had lost a tile on 10 loads of 10. In 2D only: in a scene the same property is also false when the
 * scene has thinned a layer's features, which is not a lost query, and would make every click ask every layer.
 */
export async function queryPopupLayersAtClick(view: esri.MapView | esri.SceneView, point: esri.Point): Promise<esri.Graphic[]> {
  const layerViews = view.allLayerViews.toArray();
  const layers = (view.map?.allLayers.toArray() ?? [])
    .filter((layer) => (layer as PopupLayer).popupComponent && typeof (layer as esri.FeatureLayer).queryFeatures === 'function')
    .filter((layer) => {
      const layerView = layerViews.find((candidate) => candidate.layer === layer);

      return layerView ? !layerView.suspended && (layerView.updating || isMissingFeatures(view, layerView)) : layer.visible;
    })
    .reverse() as esri.FeatureLayer[];

  const answers = await Promise.all(
    layers.map((layer) => {
      const byDistance = layer.geometryType !== 'polygon' && view.resolution > 0;

      return layer
        .queryFeatures({
          geometry: point,
          spatialRelationship: 'intersects',
          ...(byDistance ? { distance: view.resolution * CLICK_TOLERANCE_PIXELS, units: 'meters' as const } : {}),
          outFields: ['*'],
          returnGeometry: true
        })
        .then((result) => result.features.map((feature) => Object.assign(feature, { layer: feature.layer ?? layer })))
        .catch(() => [] as esri.Graphic[]);
    })
  );

  return answers.flat();
}

/**
 * Whether a 2D feature layer view has drawn without some of the features in view, because a query for them failed.
 * Only `false` counts: a layer view with no such property (a graphics layer's, say) is not taken to be missing anything.
 */
function isMissingFeatures(view: esri.MapView | esri.SceneView, layerView: esri.LayerView): boolean {
  return view.type === '2d' && (layerView as esri.FeatureLayerView).hasAllFeaturesInView === false;
}

/** A layer that opens a popup: a definition's `popupComponent`, put on the layer when it is made. */
type PopupLayer = esri.Layer & { popupComponent?: unknown };
