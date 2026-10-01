import { BaseMapProperties } from '@tamu-gisc/maps/esri';

/**
 * The campus basemap, as vector tiles.
 *
 * Published in EPSG:32139 (Texas State Plane Central), not Web Mercator like the rest of the gallery.
 * That is deliberate on the publisher's side and the API supports it: from 4.23 the view changes its
 * own spatial reference when a basemap in another projection is selected. It needs the projection
 * engine loaded first - see `BasemapGalleryService`.
 *
 * No `spatialReference` here: a VectorTileLayer takes it from the service's tiling scheme and the
 * property is read-only. No `minScale`/`maxScale` either, because the cache carries its own levels.
 */
export const AggiemapBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'VectorTileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase/VectorTileServer`,
      listMode: 'hide',
      visible: true,
      title: 'Base Map'
    }
  ],
  id: 'aggie_basemap',
  title: 'Aggieland',
  thumbnailUrl:
    'https://divops.tamu.edu/portal/sharing/rest/content/items/0786efd67d0a467e8da4d889b7364ddb/info/thumbnail/_7B6C3A79E6-2D18-4FB5-87C9-99192ACA9248_7D.png'
};

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
  thumbnailUrl: 'https://aggiemap.tamu.edu/images/basemap_thumbnails/nearmap_imagery.png'
};
