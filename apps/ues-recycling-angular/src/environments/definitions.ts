import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';

import esri = __esri;

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  recyclingPointsUrl: 'https://ues-arc.tamu.edu/arcgis/rest/services/Recycling/Utilities_Recycilng_WebMap/MapServer/0'
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

const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.RECYCLING.layerId,
    title: Definitions.RECYCLING.name,
    url: Definitions.RECYCLING.url,
    listMode: 'hide',
    visible: true,
    layerIndex: 2,
    native: {
      ...commonLayerProps,
      definitionExpression: "public_view LIKE 'Yes'"
    }
  },
  {
    type: 'graphic',
    id: 'selection-layer',
    title: 'Selected Buildings',
    category: 'Infrastructure',
    listMode: 'hide',
    visible: true
  }
];

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export const SearchSources: SearchSource[] = [];

export const SelectionSymbols = {
  polygon: {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.55],
    outline: {
      color: [252, 227, 0, 0.8],
      width: '2px'
    }
  },
  point: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  },
  multipoint: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  }
};
