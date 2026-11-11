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
 * The main campus's features, as data: the feature service the vector tile basemap (`Hosted/VTBase3`) is published from
 * (#2707, #2722). Public on the production GIS server, with no key or token; the vector tiles themselves are gated as
 * development-only (#1229), but this service is not. It replaces every feature layer of `TAMU_CAMPUS_BASEMAP_URL` that
 * has a counterpart here, with the same rows and fields, the field names in lower case:
 *
 * | old `TAMU_CAMPUS_BASEMAP_URL` layer | here |
 * | --- | --- |
 * | 1 Structure Data | 0 Campus Structures, `number IS NOT NULL` (1,003 rows on both) |
 * | 2 University Building, `Type = 'CONSTRUCTION'` | 0 Campus Structures, `type = 'CONSTRUCTION'` (the same 8) |
 * | 9 Surface Parking | 6 Surface Parking (340 rows against 341: only Lot 8712 is missing here) |
 *
 * Layer 0 of the old service, Garage Parking, has no counterpart: 8 of its 10 garages are buildings in Campus
 * Structures, with building fields rather than lot ones, and Residents Garage and Park West Garage are not here at all.
 * So the garage search still reads the old service, until the GIS team says where the garages are meant to be (#2722).
 */
export const TAMU_CAMPUS_FEATURES_URL = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/FeatureServer';

/**
 * The main campus's buildings: layer 0, "Campus Structures", of `TAMU_CAMPUS_FEATURES_URL` (#2707).
 *
 * It replaced layer 1, "Structure Data", of `TAMU_CAMPUS_BASEMAP_URL`, which the maintainer retired as a source on
 * 9 November 2026. That layer failed about one query in twenty at random (14 of 300, 4.7%, against 0 of 300 for this one, measured
 * 9 November 2026), answering HTTP 200 with the error in the body,
 * and a failed tile left a part of the map where no building could be clicked for the rest of the visit (#2702, #2707).
 *
 * The same buildings and the same fields, with every field name in lower case (`bldgname`, `number`, `bldgabbrev`,
 * `address`), so every reader of a building's attributes reads them in lower case.
 */
export const TAMU_CAMPUS_STRUCTURES_URL = `${TAMU_CAMPUS_FEATURES_URL}/0`;

/** The main campus's surface parking lots: layer 6, "Surface Parking", of `TAMU_CAMPUS_FEATURES_URL` (#2722). */
export const TAMU_CAMPUS_SURFACE_LOTS_URL = `${TAMU_CAMPUS_FEATURES_URL}/6`;

/**
 * The main campus's trees: layer 1, "Trees", of `TAMU_CAMPUS_FEATURES_URL`. 16,219 points; `canopy_spread` (feet across
 * the crown) is filled for 15,900 and `height` (feet) for 8,944; 282 carry a `date_removed` (10 November 2026). Read by
 * the shade-aware walking prototype for the shade trees cast.
 */
export const TAMU_CAMPUS_TREES_URL = `${TAMU_CAMPUS_FEATURES_URL}/1`;

/**
 * The 2019 SketchUp campus models as a feature layer: the footprints and roof and ground elevations behind the
 * `SketchupCampus_2082019` scene layer the 3D map draws. 731 models, every one with `z_Roofmedian` and `z_Groundmedian`
 * (metres, stored as text); 362 of today's 860 campus buildings share a building number with one (10 November 2026).
 * Not updated since February 2019, so a building built since has no model.
 */
export const TAMU_CAMPUS_BUILDING_MODELS_URL =
  'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/SketchupCampus_2082019/FeatureServer/0';
