import esri = __esri;

/** The layer classes a basemap's base layers can be made from, keyed by the `type` a definition names. */
export interface BaseLayerConstructors {
  TileLayer: typeof esri.TileLayer;
  VectorTileLayer: typeof esri.VectorTileLayer;
  WMSLayer: typeof esri.WMSLayer;
}

/**
 * Makes one base layer from a basemap definition's plain description of it, `{ type, ...properties }`.
 *
 * `WMSLayer` is Aerial Imagery (Nearmap). Without it a saved Aerial Imagery choice could not be opened
 * from its definition, and an event map started with no basemap at all (#1692).
 */
export function makeBaseLayer(
  layer: { type?: string } & Record<string, unknown>,
  constructors: BaseLayerConstructors
): esri.Layer {
  if (!layer.type) {
    throw new Error(`Layer type is required.`);
  }

  // Remove the type property because it conflicts as a read-only property when instantiating the class.
  const { type, ...props } = layer;

  if (type === `TileLayer`) {
    return new constructors.TileLayer(props);
  }

  if (type === `VectorTileLayer`) {
    return new constructors.VectorTileLayer(props);
  }

  if (type === `WMSLayer`) {
    return new constructors.WMSLayer(props);
  }

  // Anything else used to fall out of this map as `undefined`, which Esri only reports much
  // later as "Cannot read properties of undefined (reading 'parent')" from deep inside
  // Basemap.addMany - a stack trace with nothing in it pointing here. Fail where the mistake is.
  throw new Error(`Unsupported basemap layer type '${type}'. Add a case here to support it.`);
}
