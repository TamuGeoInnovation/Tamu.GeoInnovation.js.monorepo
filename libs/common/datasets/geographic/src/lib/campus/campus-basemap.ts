/**
 * Texas A&M's main campus basemap as raster tiles: a cached map service in Web Mercator tiles (256-pixel PNG, levels 0
 * to 23), public on the production GIS server, with no key or token.
 *
 * **Abandoned**: the maintainer decided on 9 November 2026 that nothing is to read it. The campus basemap is
 * `TAMU_CAMPUS_VECTOR_BASEMAP_URL` below. What still names this one is being moved off it; it is written here once so
 * that moving each one is a change in one place.
 */
export const TAMU_CAMPUS_BASEMAP_URL = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';

/**
 * Texas A&M's main campus basemap as vector tiles, `Hosted/VTBase3`: Web Mercator (`wkid` 102100, 23 levels), public
 * on the production GIS server with no key or token, and AggieMap's default on every environment since #2515.
 *
 * It publishes a MapLibre style (version 8, 115 layers, with a sprite and glyphs) at `resources/styles/root.json`,
 * which the GIS Day competition maps draw (`libs/maps/mapbox`). This used to be ruled out for them because the vector
 * version of the day, `Hosted/VTBase`, was in Texas State Plane, which MapLibre cannot draw, and was not on production
 * (#1229). Neither is true of VTBase3.
 */
export const TAMU_CAMPUS_VECTOR_BASEMAP_URL = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/VectorTileServer';

/**
 * The main campus's buildings, as data: layer 0, "Campus Structures", of the feature service the vector tile basemap
 * (`Hosted/VTBase3`) is published from (#2707, #2722). Public on the production GIS server, with no key or token; the
 * vector tiles themselves are development-only (#1229), but this service is not.
 *
 * It replaced layer 1, "Structure Data", of `TAMU_CAMPUS_BASEMAP_URL`, which the maintainer retired as a source on
 * 9 November 2026. That layer failed about one query in twenty at random (14 of 300, 4.7%, against 0 of 300 for this one, measured
 * 9 November 2026), answering HTTP 200 with the error in the body,
 * and a failed tile left a part of the map where no building could be clicked for the rest of the visit (#2702, #2707).
 *
 * The same buildings and the same fields, with every field name in lower case (`bldgname`, `number`, `bldgabbrev`,
 * `address`), so every reader of a building's attributes reads them in lower case.
 */
export const TAMU_CAMPUS_STRUCTURES_URL = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/FeatureServer/0';
