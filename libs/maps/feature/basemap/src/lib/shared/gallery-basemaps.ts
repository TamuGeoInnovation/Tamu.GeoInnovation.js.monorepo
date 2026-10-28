import { BaseLayerConstructors, BaseMapProperties, makeBaseLayer } from '@tamu-gisc/maps/esri';

import esri = __esri;

/**
 * Makes the gallery's own copy of a campus basemap from its definition.
 *
 * There is a bug in the JS API that stops a basemap from loading from an auto-castable source: its base layers
 * are plain objects, not instances, and `load()` does not exist on them. So each is made into a layer.
 *
 * Every layer goes through `makeBaseLayer`, the way the map's first basemap does, because that is where the
 * definition's `hiddenStyleLayers` and `styleLayerPaint` are applied. A copy made any other way draws the
 * published style: the pink construction sprite, where the definition hides it. And every base layer is carried,
 * not only the first: the construction hatch is the second (#2536, which is #2477 coming back).
 */
export function makeGalleryBasemap(
  definition: BaseMapProperties,
  Basemap: typeof esri.Basemap,
  constructors: BaseLayerConstructors
): esri.Basemap {
  // Cloned first: the definition is shared, and a layer class keeps the objects it is given.
  const baseLayers = definition.baseLayers.map((layer) => makeBaseLayer(JSON.parse(JSON.stringify(layer)), constructors));

  return new Basemap({ ...definition, baseLayers } as esri.BasemapProperties);
}
