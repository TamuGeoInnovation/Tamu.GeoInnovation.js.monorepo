import esri = __esri;

import { applySpriteOverrides, browserSpriteOverrideDeps, SpriteOverride } from './vector-tile-sprites';

/** PROTOTYPE (#2459): off while the hatch is tried as a layer instead of a sprite. */
const SPRITE_OVERRIDES_ENABLED = false;

/** The layer classes a basemap's base layers can be made from, keyed by the `type` a definition names. */
export interface BaseLayerConstructors {
  FeatureLayer?: typeof esri.FeatureLayer;
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
  const { type, spriteOverrides, hiddenStyleLayers, ...props } = layer as {
    type?: string;
    spriteOverrides?: SpriteOverride[];
    hiddenStyleLayers?: string[];
  } & Record<string, unknown>;

  if (type === `TileLayer`) {
    return new constructors.TileLayer(props);
  }

  if (type === `VectorTileLayer`) {
    const vectorTileLayer = new constructors.VectorTileLayer(props);

    // The sheet can only be patched once the style has loaded, and nothing waits on this: the basemap
    // draws with the published sprites and swaps to the patched ones a moment later. A failure must not
    // take the basemap down with it - a wrong hatch is better than no map (#2459).
    // PROTOTYPE (#2459, option D): the hatch is drawn by a FeatureLayer in the basemap instead, so the sprite
    // override is not applied. Applying it blanks the map on some loads (work-lab-leila report 148).
    if (SPRITE_OVERRIDES_ENABLED && spriteOverrides !== undefined && spriteOverrides.length > 0) {
      vectorTileLayer
        .when(() => applySpriteOverrides(vectorTileLayer, spriteOverrides, browserSpriteOverrideDeps()))
        .catch((error: unknown) => {
          console.warn(`Could not apply sprite overrides to ${props.url}.`, error);
        });
    }

    // PROTOTYPE (#2459): style layers turned off once the style has loaded, so a layer drawn over the basemap
    // can stand in for them. A style call, not a sprite: nothing here touches the sprite sheet.
    if (hiddenStyleLayers !== undefined && hiddenStyleLayers.length > 0) {
      vectorTileLayer
        .when(() => hiddenStyleLayers.forEach((id) => vectorTileLayer.setStyleLayerVisibility(id, 'none')))
        .catch((error: unknown) => {
          console.warn(`Could not hide style layers in ${props.url}.`, error);
        });
    }

    return vectorTileLayer;
  }

  if (type === `FeatureLayer` && constructors.FeatureLayer) {
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
