/**
 * Texas A&M's main campus basemap: a cached map service in Web Mercator tiles (256-pixel PNG, levels 0 to 23), public
 * on the production GIS server, with no key or token.
 *
 * AggieMap draws it on production (its basemap gallery and its connections), and the GIS Day competition maps
 * (`libs/maps/mapbox`, on MapLibre) draw its tiles (#1218). It is written here once so that a republished campus
 * basemap is one change for all of them. The vector tile version (`Hosted/VTBase`) is not a substitute: it is not
 * published on production (#1229) and is in Texas State Plane, which MapLibre cannot draw.
 */
export const TAMU_CAMPUS_BASEMAP_URL = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';

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
