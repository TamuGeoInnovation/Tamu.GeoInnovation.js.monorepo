import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource } from '@tamu-gisc/common/types';

import { tiers } from './tier-dictionary';

import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import esri = __esri;

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  effluentZonesUrl: 'https://ues-arc.tamu.edu/arcgis/rest/services/Sanitary/SanitarySampling/MapServer/2',
  effluentSampleLocationsUrl: 'https://ues-arc.tamu.edu/arcgis/rest/services/Sanitary/SanitarySampling/MapServer/0'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`
  }
};

export const effluentZonesUrl = Connections.effluentZonesUrl;
export const effluentSampleLocationsUrl = Connections.effluentSampleLocationsUrl;

export const effluentTiers = tiers;

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
    id: Definitions.BUILDINGS.layerId,
    title: Definitions.BUILDINGS.name,
    url: Definitions.BUILDINGS.url,
    popupComponent: Popups.BuildingPopupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    layerIndex: 2,
    native: {
      ...commonLayerProps,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'sampling-zone-1',
    title: 'Sampling Zone 1',
    url: Connections.effluentZonesUrl,
    popupComponent: Popups.BasePopupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    layerIndex: 3,
    native: {
      ...commonLayerProps,
      definitionExpression: "Tier = '1'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [158, 85, 156, 0.4],
          style: 'solid'
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'sampling-zone-2',
    title: 'Sampling Zone 2',
    url: Connections.effluentZonesUrl,
    popupComponent: Popups.BasePopupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    layerIndex: 4,
    native: {
      ...commonLayerProps,
      definitionExpression: "Tier = '2'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [167, 198, 54, 0.4],
          style: 'solid'
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'sampling-zone-3',
    title: 'Sampling Zone 3',
    url: Connections.effluentZonesUrl,
    popupComponent: Popups.BasePopupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    layerIndex: 5,
    native: {
      ...commonLayerProps,
      definitionExpression: "Tier = '3'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [20, 158, 206, 0.4],
          style: 'solid'
        }
      },
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: `$feature.SampleNumber`
          },
          symbol: {
            type: 'text',
            color: 'black',
            haloSize: '1.5pt',
            haloColor: 'white',
            font: {
              size: '8.5pt',
              family: 'Ubuntu',
              style: 'normal',
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: 'sampling-zone-4',
    title: 'Sampling Zone 4',
    url: Connections.effluentZonesUrl,
    popupComponent: Popups.BasePopupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    layerIndex: 6,
    native: {
      ...commonLayerProps,
      definitionExpression: "Tier = '4'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [237, 81, 81, 0.4],
          style: 'solid'
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'sample-testing-locations',
    title: 'Sample Testing Locations',
    url: Connections.effluentSampleLocationsUrl,
    popupComponent: Popups.BasePopupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    layerIndex: 7,
    native: {
      ...commonLayerProps,
      definitionExpression: "Tier = '3'"
    }
  },
  {
    type: 'feature',
    id: 'construction-layer',
    title: 'Construction Zones',
    url: `${Connections.constructionUrl}`,
    category: 'Infrastructure',
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ],
    popupComponent: Popups.ConstructionPopupComponent,
    layerIndex: 1,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    category: 'Infrastructure',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.BasePopupComponent
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
export const SearchSources: SearchSource[] = [
  {
    source: 'building',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbrev', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbrev', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'building-exact',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: false
  },
  {
    source: 'university-departments',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['DeptName', 'CollegeName', 'DeptAbbre'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.DeptName}',
    popupComponent: Popups.BasePopupComponent,
    searchActive: true,
    altLookup: {
      source: 'building-exact',
      reference: {
        keys: ['attributes.HOME1']
      }
    }
  },
  {
    source: 'university-departments-exact',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 100,
      where: {
        keys: ['HOME1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.DeptName}',
    searchActive: false
  },
  {
    source: 'parking-garage',
    name: 'Parking Garage',
    url: `${Connections.basemapUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName', 'Name'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'parking-lot',
    name: 'Parking Lot',
    url: `${Connections.basemapUrl}/12`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.ParkingLotPopupComponent,
    searchActive: true
  },
  {
    source: 'points-of-interest',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Name'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.Name}',
    popupComponent: Popups.PoiPopupComponent,
    searchActive: true
  },
  {
    source: 'bike-racks',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 9999,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.Type}',
    searchActive: false
  }
];

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
