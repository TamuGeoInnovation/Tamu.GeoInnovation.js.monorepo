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
