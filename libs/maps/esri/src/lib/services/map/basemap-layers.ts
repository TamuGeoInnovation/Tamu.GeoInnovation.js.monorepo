import esri = __esri;

/** The layer classes a basemap's base layers can be made from, keyed by the `type` a definition names. */
export interface BaseLayerConstructors {
  FeatureLayer: typeof esri.FeatureLayer;
  TileLayer: typeof esri.TileLayer;
  VectorTileLayer: typeof esri.VectorTileLayer;
  WMSLayer: typeof esri.WMSLayer;
}

/** Changes to a vector tile layer's own style, by style layer id, made once the style has loaded. */
export interface StyleLayerChanges {
  /** Style layers to turn off (#2459, #2532). */
  hiddenStyleLayers?: string[];
}

/**
 * Makes the changes once the style has loaded. These are style calls only: nothing here touches the sprite sheet.
 * Replacing the sheet with `setSpriteSource` left the map blank on about one load in four, and patched some tiles
 * and not others in the same session (#2459). A failure must not take the basemap down with it.
 */
export function applyStyleLayerChanges(layer: esri.VectorTileLayer, changes: StyleLayerChanges): void {
  const hidden = changes.hiddenStyleLayers ?? [];

  if (hidden.length === 0) {
    return;
  }

  layer
    .when(() => {
      hidden.forEach((id) => layer.setStyleLayerVisibility(id, 'none'));
    })
    .catch((error: unknown) => {
      console.warn(`Could not change the style of ${layer.url}.`, error);
    });
}

/**
 * Makes one base layer from a basemap definition's plain description of it, `{ type, ...properties }`.
 *
 * `WMSLayer` is Aerial Imagery (Nearmap). Without it a saved Aerial Imagery choice could not be opened
 * from its definition, and an event map started with no basemap at all (#1692).
 *
 * `FeatureLayer` lets a basemap draw something the tiles draw badly, from a queryable service, with our own
 * symbol: the campus basemap's buildings under construction (#2459).
 */
export function makeBaseLayer(
  layer: { type?: string } & Record<string, unknown>,
  constructors: BaseLayerConstructors
): esri.Layer {
  if (!layer.type) {
    throw new Error(`Layer type is required.`);
  }

  // Remove the type property because it conflicts as a read-only property when instantiating the class.
  // `hiddenStyleLayers` is ours rather than Esri's and is applied below, so it comes out here too.
  const { type, hiddenStyleLayers, ...props } = layer as {
    type?: string;
  } & StyleLayerChanges &
    Record<string, unknown>;

  if (type === `TileLayer`) {
    return new constructors.TileLayer(props);
  }

  if (type === `VectorTileLayer`) {
    const vectorTileLayer = new constructors.VectorTileLayer(props);

    applyStyleLayerChanges(vectorTileLayer, { hiddenStyleLayers });

    return vectorTileLayer;
  }

  if (type === `FeatureLayer`) {
    return new constructors.FeatureLayer(props);
  }

  if (type === `WMSLayer`) {
    return new constructors.WMSLayer(props);
  }

  // Anything else used to fall out of this map as `undefined`, which Esri only reports much
  // later as "Cannot read properties of undefined (reading 'parent')" from deep inside
  // Basemap.addMany - a stack trace with nothing in it pointing here. Fail where the mistake is.
  throw new Error(`Unsupported basemap layer type '${type}'. Add a case here to support it.`);
}
