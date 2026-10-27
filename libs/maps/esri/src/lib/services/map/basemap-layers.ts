import esri = __esri;

import { holdSpriteOverrides, SpriteOverride } from './vector-tile-sprites';

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
  // `spriteOverrides` is ours rather than Esri's and is applied below, so it comes out here too.
  const { type, spriteOverrides, ...props } = layer as { type?: string; spriteOverrides?: SpriteOverride[] } & Record<
    string,
    unknown
  >;

  if (type === `TileLayer`) {
    return new constructors.TileLayer(props);
  }

  if (type === `VectorTileLayer`) {
    const vectorTileLayer = new constructors.VectorTileLayer(props);

    // Held, not applied. `setSpriteSource` has to happen after the view has made this layer's layer
    // view; called when the layer loads it resolves and is then thrown away, which is how the hatch
    // reached dev looking unfixed twice on 27 October (#2459, #2477). `EsriMapService.useView` applies
    // them once the view is ready.
    if (spriteOverrides !== undefined) {
      holdSpriteOverrides(vectorTileLayer, spriteOverrides);
    }

    return vectorTileLayer;
  }

  if (type === `WMSLayer`) {
    return new constructors.WMSLayer(props);
  }

  // Anything else used to fall out of this map as `undefined`, which Esri only reports much
  // later as "Cannot read properties of undefined (reading 'parent')" from deep inside
  // Basemap.addMany - a stack trace with nothing in it pointing here. Fail where the mistake is.
  throw new Error(`Unsupported basemap layer type '${type}'. Add a case here to support it.`);
}
