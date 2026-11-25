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
 * Texas A&M's main campus basemap as vector tiles, `Hosted/VTBase4`: Web Mercator (`wkid` 102100, 23 levels), public
 * on the production GIS server with no key or token, and AggieMap's default on every environment since #2515.
 *
 * It publishes a MapLibre style (version 8, 115 layers, with a sprite and glyphs) at `resources/styles/root.json`,
 * which the GIS Day competition maps draw (`libs/maps/mapbox`). This used to be ruled out for them because the vector
 * version of the day, `Hosted/VTBase`, was in Texas State Plane, which MapLibre cannot draw, and was not on production
 * (#1229). Neither is true of VTBase4.
 */
/**
 * Why VTBase4 and not VTBase3 (#3299, the maintainer, 23 November 2026).
 *
 * The November 2026 cache became the campus basemap on every environment, and nothing here points at the October
 * one any more. The tiles and the data they are published from have to be one source (#2722): the two feature
 * services disagree about what is under construction - VTBase3 still carries the Easterwood Airport ARFF Station
 * and lacks the Golf Performance Center and Last Energy PWR5 Facility - so reading VTBase3 while drawing VTBase4's
 * tiles would hatch a finished building and leave two under-construction ones with neither hatch nor outline,
 * because the basemap hides the tiles' own construction outline (#2459).
 *
 * Checked before the move, anonymously: both feature services carry the same 0 Campus Structures and 6 Surface
 * Parking, both declare `objectid` and have it (#2510), and VTBase4 holds 1,987 structures to VTBase3's 1,984 and
 * 343 surface lots to 340.
 */
export const TAMU_CAMPUS_VECTOR_BASEMAP_URL = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase4/VectorTileServer';

/**
 * The main campus's features, as data: the feature service the vector tile basemap (`Hosted/VTBase4`) is published from
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
 * Layer 0 of the old service, Garage Parking, has no layer of its own here - its garages are rows of 0 Campus
 * Structures, marked `type = 'GARAGE'` or `'GARAGE PVT'`, with building fields rather than lot ones. The garage search
 * reads them there since #3425.
 *
 * **All ten are present.** An earlier note here said Residents Garage and Park West Garage were "not here at all";
 * that was measured by matching names, and both are here under different ones. Matched by geometry on
 * 24 November 2026: Residents Garage is `Century Square Parking Deck` (PC27) and Park West Garage is
 * `Park West J - 3000/4000` (PB09). Match these two services on `bldgabbrev`, which carries the same codes the old
 * layer's `Name` did, rather than on a name - that is what makes a `?garage=CCG` link survive the move.
 *
 * Where the names differ, Facilities' are the published ones and Transportation's are what a visitor may type. That
 * is the GIS team's to reconcile, not ours to paper over.
 */
export const TAMU_CAMPUS_FEATURES_URL = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase4/FeatureServer';

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
