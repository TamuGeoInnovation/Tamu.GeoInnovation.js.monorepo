import { BaseMapProperties } from '@tamu-gisc/maps/esri';

export const AggiemapBasemap: BaseMapProperties = {
  baseLayers: [
    {
      type: 'TileLayer',
      url: `https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer`,
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
  thumbnailUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer/info/thumbnail'
};
