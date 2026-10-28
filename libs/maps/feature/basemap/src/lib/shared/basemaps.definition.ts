import { BaseMapProperties, CONSTRUCTION_HATCH_RENDERER } from '@tamu-gisc/maps/esri';
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
 * The buildings under construction are drawn by us, not by the tiles (#2459). The published style fills them
 * with a sprite pattern the vector tile packager rasterized onto an opaque tile, so each draws as a solid pink
 * block. Its fill layer is hidden and a layer from the campus buildings service draws them instead, with the
 * hatch the maintainer settled on 27 October 2026: **an orange grid, no fill, a black outline**. The outline is
 * ours too: anything added to a vector tile basemap draws above all of it, so the style's own outline would sit
 * under our grid and read as a dashed line. This replaces published symbology; see `docs/map-layers.md`.
 * Replacing the pattern in the sprite sheet instead (`setSpriteSource`) left the map blank on about one load
 * in four, so that was deleted.
 */
export const AggiemapVectorBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'VectorTileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/VectorTileServer`,
      listMode: 'hide',
      visible: true,
      title: 'Base Map',
      // The construction fill (`/1`, a `fill-pattern` of the rasterized pink) and its black outline (`/0`, a
      // line) are hidden; the layer below draws both instead. The outline has to move with the fill: a layer
      // added to a vector tile basemap can only draw above the whole of it, so the style's outline would sit
      // under the grid and be broken by every line crossing it.
      hiddenStyleLayers: [
        'Campus Structures/Currently Under Construction/1',
        'Campus Structures/Currently Under Construction/0'
      ]
    },
    // The buildings under construction, drawn over the tiles with the hatch every campus shares
    // (`CONSTRUCTION_HATCH_RENDERER`, #2532). The Construction Zones layer's default Building Projects class is red, so
    // where a building under construction sits inside one, a red diagonal cross draws over this grid. Part of this
    // basemap, so it shows only where the vector basemap does. The service and the tiles agreed on all eight buildings
    // on 27 October.
    {
      type: 'FeatureLayer',
      url: `${TAMU_CAMPUS_BASEMAP_URL}/2`,
      definitionExpression: "Type = 'CONSTRUCTION'",
      title: 'Buildings under construction',
      listMode: 'hide',
      popupEnabled: false,
      renderer: CONSTRUCTION_HATCH_RENDERER
    }
  ],
  id: 'aggie_basemap',
  // The default on every environment since #2515, so plain "Aggieland", as the raster one was. The cache is
  // `TAMU_BaseMap_20261026`, published on 26 October 2026 (#2436).
  title: 'Aggieland',
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
 * The deepest scale every campus basemap a view can show has tiles for: level 21, 1:282 (#1577).
 *
 * `TAMU_Basemap_20261008`'s tiling scheme lists 24 levels, down to 1:70, but its cache stops at level 21
 * and the service says so in its own `maxScale`. A view allowed past it zooms into levels with no tiles,
 * and the map goes white under the layers. Every AggieMap view stops here: use this as
 * `constraints.maxScale`, never `0`.
 *
 * The vector basemap, production's default since #2515, caches two levels deeper, to 1:70.5. The limit stays
 * at the raster cache's depth because production still offers the raster basemap and some maps open on it:
 * a view allowed to 1:70.5 would go white there. The vector levels below 1:282 were looked at on 28 October
 * and draw nothing new - the same paths and grass, and the trees shrink to nothing.
 *
 * Set just below level 21's 282.124294 rather than equal to it: at exactly that value the view stopped a
 * level early, at 20.
 *
 * This asked whoever republished the basemap to raise the number to the new service's `maxScale`, and
 * when one was (#1695) the number was right only because the October 2026 cache happens to stop at the
 * same level the June one did. A comment cannot be relied on to be read, so `services.spec.ts` asks each
 * campus basemap service production offers for its `maxScale`, and fails when this is deeper than any of them
 * or no longer the shallowest.
 */
export const AGGIEMAP_BASEMAP_MAX_SCALE = 282;

/**
 * The campus basemap a map opens on: the vector tiles, on every environment since #2515.
 *
 * It was the raster basemap on production until then, because the vector service had no production counterpart and a
 * service without one must never be visible on production unless that is explicitly allowed (#1229). It is now, so the
 * smoke suite's development-only list no longer names it. Every map still takes its campus basemap from here, so the
 * next version can be gated by environment in one place.
 */
export function aggiemapBasemap(): BaseMapProperties {
  return AggiemapVectorBasemap;
}

/**
 * The raster campus basemap, for a map that opens on it, and the gallery's way back to it. On development it is the
 * gallery's dated entry, Aggieland raster, October 2026; on production, Aggieland raster. Either way the panel marks it
 * as the one showing. Its id is its own on production too: the vector basemap took `aggie_basemap` with #2515, and the
 * gallery tells basemaps apart by id.
 */
export function aggiemapRasterBasemap(isTesting: boolean): BaseMapProperties {
  return isTesting
    ? { ...AggiemapRasterBasemap, id: 'aggie_basemap_raster_2026_10', title: 'Aggieland raster, October 2026' }
    : { ...AggiemapRasterBasemap, id: 'aggie_basemap_raster', title: 'Aggieland raster' };
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
 * Production offers two (#2515): the vector basemap it opens on, and the raster one it showed until then. If something
 * is wrong with the vector basemap on production, a single entry would leave a visitor no way out and us no mitigation
 * short of another release; the raster entry is that way out.
 *
 * Development opened on the vector tiles and could not show the raster basemap at all, so a new raster cache went to
 * production without anyone having seen it drawn on dev (#1695). Development therefore also offers the raster basemap,
 * under its own id and dated, and the earlier versions still published, so they can be compared before one is chosen.
 *
 * The first entry is the one the map opens on, and is always `aggiemapBasemap()`.
 *
 * When a version is republished, raster or vector, date the current one here and add the one it
 * replaces, so the two can be compared before one is chosen (#2436).
 */
export function aggiemapGalleryBasemaps(isTesting: boolean): BaseMapProperties[] {
  if (!isTesting) {
    return [aggiemapBasemap(), aggiemapRasterBasemap(isTesting)];
  }

  return [
    aggiemapBasemap(),
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

  return id.startsWith(AggiemapRasterBasemap.id) ? aggiemapBasemap() : id;
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
