import esri = __esri;

/**
 * How construction is drawn wherever a basemap's own tiles draw it badly: an orange grid, no fill, a black
 * outline. The maintainer settled on it for College Station on 27 October 2026 (#2459) and asked for the
 * satellite campuses to match on 28 October (#2532), so every campus draws it from here.
 *
 * The outline is the first symbol layer, because CIM draws the first on top, so it stays one continuous line
 * over the grid; black, 1 pt (1.33 px), as the tiles drew it. The grid is two CIM hatches, 0 and 90 degrees,
 * lines 12 pt (16 px) apart and 1.5 pt (2 px) wide, so about a quarter of the area is covered and the ground
 * shows through. The spacing is in screen points, so the grid is the same at every zoom. Orange,
 * rgb(230, 152, 0), is the maintainer's choice and the Construction Zones layer's UES Projects class.
 *
 * The tiles' own construction fill and outline are hidden where this draws: anything added to a vector tile
 * basemap draws above all of it, so the tiles' outline would sit under the grid and be broken by every line
 * crossing it. This replaces published symbology; see `docs/map-layers.md`.
 */
export const CONSTRUCTION_HATCH_RENDERER = {
  type: 'simple',
  symbol: {
    type: 'cim',
    data: {
      type: 'CIMSymbolReference',
      symbol: {
        type: 'CIMPolygonSymbol',
        symbolLayers: [
          { type: 'CIMSolidStroke', enable: true, width: 1, color: [0, 0, 0, 255] },
          ...[0, 90].map(
            (rotation): esri.CIMHatchFill => ({
              type: 'CIMHatchFill',
              enable: true,
              rotation,
              separation: 12,
              lineSymbol: {
                type: 'CIMLineSymbol',
                symbolLayers: [{ type: 'CIMSolidStroke', enable: true, width: 1.5, color: [230, 152, 0, 255] }]
              }
            })
          )
        ]
      }
    }
  }
} satisfies esri.SimpleRendererProperties & { type: 'simple' };
