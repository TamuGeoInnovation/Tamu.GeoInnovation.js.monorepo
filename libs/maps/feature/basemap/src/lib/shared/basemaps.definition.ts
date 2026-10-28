import { BaseMapProperties } from '@tamu-gisc/maps/esri';
import { TAMU_CAMPUS_BASEMAP_URL } from '@tamu-gisc/common/datasets/geographic';

/**
 * The picture of a campus basemap in the basemap panel, shipped with the application (#1730).
 *
 * Each campus basemap used to name its own thumbnail, on its GIS service or its portal item. Those
 * answer `max-age=0`, so every map load fetched every one again - three copies of the same 133 KB
 * picture for the raster versions and another for the vector one - and on dev, where the panel lists
 * four, they could be watched arriving one after another.
 *
 * One image for all of them: at this size the vector basemap and the raster versions look the same.
 * When one comes to look clearly different, give it a picture of its own beside this one. Captured
 * from `TAMU_Basemap_20261008`'s own thumbnail and resampled to twice the size the panel draws it at.
 */
const CAMPUS_BASEMAP_THUMBNAIL = '/assets/images/basemap_thumbnails/aggieland.png';

/**
 * The campus basemap, as raster tiles. What production shows.
 *
 * The vector tile cache below is not published for production, so production keeps this one until
 * it is (#1229). Resolve the campus basemap with `aggiemapBasemap()`, never by naming either constant.
 */
// Typed with its id, which every saved campus basemap id starts with (basemapForSavedId).
export const AggiemapRasterBasemap: BaseMapProperties & { id: string } = {
  baseLayers: [
    {
      type: 'TileLayer',
      url: TAMU_CAMPUS_BASEMAP_URL,
      spatialReference: {
        wkid: 102100
      },
      listMode: 'hide',
      visible: true,
      minScale: 100000,
      maxScale: 0,
      title: 'Base Map'
    }
  ],
  id: 'aggie_basemap',
  title: 'Aggieland',
  thumbnailUrl: CAMPUS_BASEMAP_THUMBNAIL
};

/**
 * The campus basemap, as vector tiles. Development only, until the service is published for
 * production (#1229).
 *
 * Published in EPSG:32139 (Texas State Plane Central), not Web Mercator like the rest of the gallery.
 * That is deliberate on the publisher's side and the API supports it: from 4.23 the view changes its
 * own spatial reference when a basemap in another projection is selected. It needs the projection
 * engine loaded first - see `BasemapGalleryService`.
 *
 * No `spatialReference` here: a VectorTileLayer takes it from the service's tiling scheme and the
 * property is read-only. No `minScale`/`maxScale` either, because the cache carries its own levels.
 *
 * `spriteOverrides` replaces the under-construction buildings' pattern, which the vector tile packager
 * rasterized into a tile with no transparent pixels in it, so it paints each building as a solid block
 * instead of a hatch over it. The maintainer settled the replacement on 27 October 2026: **hatched
 * orange, no pink** - orange being what the Construction Zones layer already uses for its projects.
 * This is an override of published symbology and comes out when the service carries the hatch itself.
 * See #2459 and `docs/map-layers.md`.
 */
export const AggiemapVectorBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'VectorTileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/VectorTileServer`,
      listMode: 'hide',
      visible: true,
      title: 'Base Map',
      // PROTOTYPE (#2459, option D): the published construction fill is turned off and the layer below draws
      // the hatch instead. The outline, `.../Currently Under Construction/0`, stays.
      hiddenStyleLayers: ['Campus Structures/Currently Under Construction/1'],
      spriteOverrides: [
        {
          sprite: 'Campus Structures/Currently Under Construction/1',
          // What the maintainer asked for on 27 October 2026: a black outline, a checkered hatch, and
          // no fill of any kind. The outline is the style's own line layer and is left alone; this
          // replaces only the pattern. The checkering is the one the service already draws - what was
          // wrong with it was that it came packaged on an opaque white background, and in pink.
          //
          // Orange is the maintainer's choice (27 October 2026). It is one of the colours the
          // Construction Zones layer already uses - rgb(230, 152, 0) is its UES Projects class - but
          // that layer has no single construction colour: SSC is green, TS light blue, TxDOT blue, and
          // its default "Building Projects" class is red. So where a building under construction sits
          // inside a Building Projects zone, this orange grid draws under a red diagonal cross.
          //
          // 64 is a power of two as Esri's picture-fill guidance asks, and 16 divides it, which is what
          // lets the lines meet across the tile's edges without a seam.
          //
          // The published tile drew its lines four pixels apart, and at that spacing a grid stops
          // reading as lines and starts reading as a fill - which is half of what was wrong with it.
          // Sixteen apart covers about a quarter of the tile, so the basemap is plainly visible
          // through it.
          hatch: { size: 64, spacing: 16, lineWidth: 2, color: 'rgb(230, 152, 0)', pattern: 'grid' }
        }
      ]
    },
    // PROTOTYPE (#2459, option D): the hatch as a layer, not a sprite. The buildings under construction,
    // from the campus buildings service, drawn as an orange grid with a CIM hatch: lines 16 px (12 pt)
    // apart and 2 px (1.5 pt) wide, like the sprite override above, over the basemap's own published fill.
    // Part of this basemap, so it shows only where the vector basemap does.
    {
      type: 'FeatureLayer',
      url: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer/2',
      definitionExpression: "Type = 'CONSTRUCTION'",
      title: 'Buildings under construction',
      listMode: 'hide',
      popupEnabled: false,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'cim',
          data: {
            type: 'CIMSymbolReference',
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [0, 90].map((rotation) => ({
                type: 'CIMHatchFill',
                enable: true,
                rotation,
                separation: 12,
                lineSymbol: {
                  type: 'CIMLineSymbol',
                  symbolLayers: [{ type: 'CIMSolidStroke', enable: true, width: 1.5, color: [230, 152, 0, 255] }]
                }
              }))
            }
          }
        }
      }
    }
  ],
  id: 'aggie_basemap',
  // Dated like the versions beside it in the dev gallery (#1582): `TAMU_BaseMap_20261026`, published
  // on 26 October 2026 and given to us for development testing (#2436). Name it plain "Aggieland"
  // when it becomes production's basemap.
  title: 'Aggieland vector, October 2026',
  thumbnailUrl: CAMPUS_BASEMAP_THUMBNAIL
};

/**
 * The vector tile basemap development opened on until 26 October 2026, kept so the two can be
 * compared side by side before either becomes production's (#2436).
 *
 * The newer cache is the one the map opens on; this one stays in the gallery under its own id, the
 * way a replaced raster version does. It goes when the comparison is settled.
 *
 * Its under-construction buildings are wrong too, and differently: this cache has no construction
 * sprite at all, and paints them with a solid `fill-color` of the authored pink. So the sprite
 * override above would have nothing to replace here. It is left alone deliberately - this cache is on
 * its way out, and a second override on something being deleted is a cost with no return (#2459).
 */
export const AggiemapVectorBasemapSeptember2026: BaseMapProperties = {
  baseLayers: [
    {
      type: 'VectorTileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase/VectorTileServer`,
      listMode: 'hide',
      visible: true,
      title: 'Base Map'
    }
  ],
  id: 'aggie_basemap_vector_2026_09',
  title: 'Aggieland vector, September 2026',
  thumbnailUrl: CAMPUS_BASEMAP_THUMBNAIL
};

/**
 * The campus basemap for this environment: vector tiles where `TestingService` reports `isTesting`
 * (dev and localhost), raster tiles everywhere else.
 *
 * A service without a production counterpart must never be visible on production unless that is
 * explicitly allowed - the rule that keeps bus routes off production. Production is the default here,
 * so a caller that cannot tell which environment it is in gets the published basemap.
 */
/**
 * The deepest scale the campus basemap has tiles for: level 21, 1:282 (#1577).
 *
 * `TAMU_Basemap_20261008`'s tiling scheme lists 24 levels, down to 1:70, but its cache stops at level 21
 * and the service says so in its own `maxScale`. A view allowed past it zooms into levels with no tiles,
 * and the map goes white under the layers. Every AggieMap view stops here: use this as
 * `constraints.maxScale`, never `0`.
 *
 * Set just below level 21's 282.124294 rather than equal to it: at exactly that value the view stopped a
 * level early, at 20.
 *
 * This asked whoever republished the basemap to raise the number to the new service's `maxScale`, and
 * when one was (#1695) the number was right only because the October 2026 cache happens to stop at the
 * same level the June one did. A comment cannot be relied on to be read, so `services.spec.ts` now asks
 * the named service for its `maxScale` and fails when this disagrees with it.
 */
export const AGGIEMAP_BASEMAP_MAX_SCALE = 282;

export function aggiemapBasemap(isTesting: boolean): BaseMapProperties {
  return isTesting ? AggiemapVectorBasemap : AggiemapRasterBasemap;
}

/**
 * The raster campus basemap, Aggieland raster, October 2026, for a map that opens on it in every
 * environment. On development it is the gallery's dated entry, so the panel marks it as the one showing.
 */
export function aggiemapRasterBasemap(isTesting: boolean): BaseMapProperties {
  return isTesting
    ? { ...AggiemapRasterBasemap, id: 'aggie_basemap_raster_2026_10', title: 'Aggieland raster, October 2026' }
    : AggiemapRasterBasemap;
}

/** An earlier raster campus basemap, drawn exactly as the current one is. */
const rasterLayer = (url: string) => ({ ...AggiemapRasterBasemap.baseLayers[0], url });

/**
 * The raster campus basemap production showed from June 2026 until the October one replaced it
 * (#1695). Development only, in the gallery, for comparing versions (#1582).
 */
export const AggiemapRasterBasemapJune2026: BaseMapProperties = {
  baseLayers: [rasterLayer('https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer')],
  id: 'aggie_basemap_raster_2026_06',
  title: 'Aggieland raster, June 2026',
  thumbnailUrl: CAMPUS_BASEMAP_THUMBNAIL
};

/** The raster campus basemap of May 2026, still published. Development only, as above (#1582). */
export const AggiemapRasterBasemapMay2026: BaseMapProperties = {
  baseLayers: [rasterLayer('https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_05152026/MapServer')],
  id: 'aggie_basemap_raster_2026_05',
  title: 'Aggieland raster, May 2026',
  thumbnailUrl: CAMPUS_BASEMAP_THUMBNAIL
};

/**
 * The campus basemaps the gallery offers in this environment (#1582).
 *
 * Production offers one, the raster basemap, as `aggiemapBasemap()` gives it. Development opens on the
 * vector tiles and could not show the raster basemap at all, so a new raster cache went to production
 * without anyone having seen it drawn on dev (#1695). Development therefore also offers the raster
 * basemap production shows, under its own id and dated, and the earlier versions still published, so
 * they can be compared before one is chosen.
 *
 * The first entry is the one the map opens on, and is always `aggiemapBasemap()`.
 *
 * When a version is republished, raster or vector, date the current one here and add the one it
 * replaces, so the two can be compared before one is chosen (#2436).
 */
export function aggiemapGalleryBasemaps(isTesting: boolean): BaseMapProperties[] {
  if (!isTesting) {
    return [aggiemapBasemap(isTesting)];
  }

  return [
    aggiemapBasemap(isTesting),
    AggiemapVectorBasemapSeptember2026,
    aggiemapRasterBasemap(isTesting),
    AggiemapRasterBasemapJune2026,
    AggiemapRasterBasemapMay2026
  ];
}

/**
 * What a saved basemap choice means in this environment (#1726).
 *
 * The gallery saves the id of the basemap a visitor chose, and a map that restores it has to turn the
 * id back into a basemap. A campus basemap's id means nothing to ArcGIS: handed over as it is, the map
 * gets no basemap at all, and with it no spatial reference and no zoom levels. So:
 *
 * - a campus basemap this environment offers is returned as its definition;
 * - a campus basemap it does not offer falls back to the environment's own campus basemap. That is a
 *   dated basemap saved on development and then opened on production, or an id retired since;
 * - anything else is one of ArcGIS's own basemap names and is returned unchanged.
 *
 * Every campus id starts with the campus basemap's own, which is what marks one that is no longer offered.
 */
export function basemapForSavedId(id: string, isTesting: boolean): BaseMapProperties | string {
  const offered = aggiemapGalleryBasemaps(isTesting).find((basemap) => basemap.id === id);

  if (offered) {
    return offered;
  }

  // Aerial Imagery is offered on every environment, and its id means as little to ArcGIS (#1692).
  if (id === NearmapCSBasemap.id) {
    return NearmapCSBasemap;
  }

  return id.startsWith(AggiemapRasterBasemap.id) ? aggiemapBasemap(isTesting) : id;
}

export const NearmapCSBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'WMSLayer',
      visible: true,
      url: `https://api.nearmap.com/wms/v1/places/17f8f9f2-dd4b-43ca-98d9-edf2f28b1361/apikey/ZTk5MTUwZjQtOTcxOC00NWEyLTliOWItYjlmODA1NjRlMmMw`,
      copyright: 'Nearmap',
      spatialReference: {
        wkid: 102100
      }
    }
  ],
  id: 'nearmap_cs_basemap',
  title: 'Aerial Imagery',
  thumbnailUrl: '/assets/images/basemap_thumbnails/nearmap_imagery.png'
};
