import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';

import esri = __esri;

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  uesGisUrl: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`
  },
  VALVES: {
    id: 'cold-water-valves',
    layerId: 'cold-water-valves-layer',
    name: 'Cold Water Valves',
    url: `${Connections.uesGisUrl}/2`
  },
  COLD_WATER: {
    id: 'cold-water',
    layerId: 'cold-water-layer',
    name: 'Cold Water',
    url: `${Connections.uesGisUrl}/1`
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
    id: Definitions.COLD_WATER.layerId,
    title: Definitions.COLD_WATER.name,
    url: Definitions.COLD_WATER.url,
    listMode: 'hide',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.VALVES.layerId,
    title: Definitions.VALVES.name,
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/BrownTown/TESTWebMap/FeatureServer/0',
    listMode: 'hide',
    visible: true,
    layerIndex: 2,
    native: {
      ...commonLayerProps,
      renderer: {
        type: 'unique-value',
        field: 'NormalPosition_1',
        field2: 'CurrentPosition_1',
        fieldDelimiter: ', ',
        defaultSymbol: {
          type: 'simple-marker',
          color: [128, 128, 128, 0.5],
          size: '5pt'
        } as unknown, // Assertion needed here because the default symbol typing is not correct. It does not recognize type 'simple-maker' as a valid symbol type.
        uniqueValueInfos: [
          {
            value: 'Open, Open',
            symbol: {
              type: 'simple-marker',
              color: [0, 92, 230, 0.5],
              size: '5pt'
            } as unknown
          },
          {
            value: 'Open, Closed',
            symbol: {
              type: 'simple-marker',
              color: 'red',
              size: '15pt',
              style: 'diamond'
            } as unknown
          },
          {
            value: 'Closed, Closed',
            symbol: {
              type: 'simple-marker',
              color: [0, 92, 230, 0.5],
              size: '5pt'
            } as unknown
          },
          {
            value: 'Closed, Open',
            symbol: {
              type: 'simple-marker',
              color: 'red',
              size: '15pt',
              style: 'diamond'
            } as unknown
          }
        ]
      }
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
