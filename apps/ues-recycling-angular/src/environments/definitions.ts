export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  effluentZonesUrl: 'https://ues-arc.tamu.edu/arcgis/rest/services/Sanitary/SanitarySampling/MapServer/2',
  recyclingPointsUrl: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/sip/FeatureServer/0'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`
  },
  RECYCLING: {
    id: 'recycling',
    layerId: 'recycling-layer',
    name: 'Recycling Centers',
    url: `${Connections.recyclingPointsUrl}`
  }
};
