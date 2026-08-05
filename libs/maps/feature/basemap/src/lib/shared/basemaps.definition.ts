import { BaseMapProperties } from '@tamu-gisc/maps/esri';

export const AggiemapBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'TileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer`,
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
  thumbnailUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer/info/thumbnail'
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
