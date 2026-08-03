import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { GAMEDAY_LAYERS, SHOWDOWN_LAYERS } from '@tamu-gisc/ts/football/ngx';

import { Popups as EventPopups } from '@tamu-gisc/ts/football/ngx';
import { getDefaultGisHost, getDefaultGisHosts } from '@tamu-gisc/aggiemap/ngx/common';
const gisHost = getDefaultGisHost();
const tsgisHost = getDefaultGisHosts().tsgisHost;

export const NotificationEvents = [];

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap_060826/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: `https://${tsgisHost}/arcgis/rest/services/TS/TS_Main/MapServer`,
  bikeRacksUrl: `https://${tsgisHost}/arcgis/rest/services/TS/TS_Bicycles/MapServer/3`,
  bikeLocationsUrl: 'https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson',
  gamedayUrl: `https://${tsgisHost}/arcgis/rest/services/TS/TSFootball/MapServer`,

  showdownUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/arcgis/rest/services/Lonestar_Showdown/FeatureServer'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    popupComponent: Popups.BuildingPopupComponent
  },
  CONSTRUCTION: {
    id: 'construction_zone',
    layerId: 'construction_zone-layer',
    name: 'Construction Zone',
    url: `${Connections.constructionUrl}`,
    popupComponent: Popups.ConstructionPopupComponent
  },
  POINTS_OF_INTEREST: {
    id: 'poi',
    layerId: 'poi-layer',
    name: 'Points of Interest',
    url: `https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/AgMap_Statues/FeatureServer/0`,
    popupComponent: Popups.PoiPopupComponent
  },
  SURFACE_LOTS: {
    id: 'surface-lots',
    layerId: 'surface-lots-layer',
    name: 'Surface Lots',
    url: `${Connections.basemapUrl}/9`,
    popupComponent: Popups.ParkingLotPopupComponent
  },
  VISITOR_PARKING: {
    id: 'visitor-parking',
    layerId: 'visitor-parking-layer',
    name: 'Visitor Parking',
    url: `${Connections.inforUrl}/3`,
    popupComponent: Popups.ParkingKioskPopupComponent
  },
  TRANSPORTATION_PARKING: {
    id: 'transportation-parking',
    layerId: 'transportation-parking-layer',
    name: 'Transportation Parking',
    url: `${Connections.tsMainUrl}/6`,
    popupComponent: Popups.ParkingKioskPopupComponent
  },
  ACESSIBLE_ENTRANCES: {
    id: 'accessible-entrances',
    layerId: 'accessible-entrances-layer',
    name: 'Accessible Entrances',
    url: `${Connections.accessibleUrl}`,
    popupComponent: Popups.AccessiblePopupComponent
  },
  BIKE_RACKS: {
    id: 'bike-racks',
    layerId: 'bike-racks-layer',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`
  },
  BIKE_LOCATIONS: {
    id: 'bike-locations',
    layerId: 'bike-locations-layer',
    name: 'VeoRide Bikes',
    url: `${Connections.bikeLocationsUrl}`
  },
  // GAMEDAY: {
  //   id: GAMEDAY_LAYERS.GAMEDAY_ROOT,
  //   layerId: GAMEDAY_LAYERS.GAMEDAY_ROOT,
  //   name: 'Gameday',
  //   url: `${Connections.gamedayUrl}/0`
  // },
  GAMEDAY_DISABLED_AND_PRESALE: {
    id: GAMEDAY_LAYERS.GAMEDAY_ROOT_DISABLED_AND_PRESALE,
    layerId: GAMEDAY_LAYERS.GAMEDAY_ROOT_DISABLED_AND_PRESALE,
    name: 'Accessible Parking and Presale',
    url: `${Connections.gamedayUrl}/1`
  },
  GAMEDAY_POIS: {
    id: GAMEDAY_LAYERS.GAMEDAY_ROOT_POIS,
    layerId: GAMEDAY_LAYERS.GAMEDAY_ROOT_POIS,
    name: 'Gameday Points of Interest',
    url: `${Connections.gamedayUrl}/2`
  },
  GAMEDAY_STRIPES: {
    id: GAMEDAY_LAYERS.GAMEDAY_STRIPES,
    layerId: GAMEDAY_LAYERS.GAMEDAY_STRIPES,
    name: 'Gameday Stripes',
    url: `${Connections.gamedayUrl}/3`
  },
  GAMEDAY_RNS_SPACES: {
    id: GAMEDAY_LAYERS.GAMEDAY_RNS_SPACES,
    layerId: GAMEDAY_LAYERS.GAMEDAY_RNS_SPACES,
    name: 'Gameday RNS Spaces',
    url: `${Connections.gamedayUrl}/4`
  },
  GAMEDAY_FOOTBALL_PARKING_LOTS: {
    id: GAMEDAY_LAYERS.GAMEDAY_FOOTBALL_PARKING_LOTS,
    layerId: GAMEDAY_LAYERS.GAMEDAY_FOOTBALL_PARKING_LOTS,
    name: 'Gameday Football Parking Lots',
    url: `${Connections.gamedayUrl}/5`
  },
  GAMEDAY_GRASS_MALL_AREAS: {
    id: GAMEDAY_LAYERS.GAMEDAY_GRASS_MALL_AREAS,
    layerId: GAMEDAY_LAYERS.GAMEDAY_GRASS_MALL_AREAS,
    name: 'Gameday Grass Mall Areas',
    url: `${Connections.gamedayUrl}/6`
  },
  GAMEDAY_GET_TO_THE_GRID: {
    id: GAMEDAY_LAYERS.GAMEDAY_GET_TO_THE_GRID,
    layerId: GAMEDAY_LAYERS.GAMEDAY_GET_TO_THE_GRID,
    name: 'Gameday Get to the Grid',
    url: `${Connections.gamedayUrl}/7`
  },
  SHOWDOWN_PRE_PAY: {
    id: SHOWDOWN_LAYERS.SHOWDOWN_PARKMOBILE_PREPAY,
    layerId: SHOWDOWN_LAYERS.SHOWDOWN_PARKMOBILE_PREPAY,
    name: 'Showdown Pre-Pay with ParkMobile',
    url: `${Connections.showdownUrl}/0`
  },
  SHOWDOWN_PARKING_LOTS: {
    id: SHOWDOWN_LAYERS.SHOWDOWN_PARKING_LOTS,
    layerId: SHOWDOWN_LAYERS.SHOWDOWN_PARKING_LOTS,
    name: 'Showdown Parking',
    url: `${Connections.showdownUrl}/1`
  }
};

export const ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.GAMEDAY_FOOTBALL_PARKING_LOTS.id,
    title: Definitions.GAMEDAY_FOOTBALL_PARKING_LOTS.name,
    url: Definitions.GAMEDAY_FOOTBALL_PARKING_LOTS.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.GAMEDAY_DISABLED_AND_PRESALE.id,
    title: Definitions.GAMEDAY_DISABLED_AND_PRESALE.name,
    url: Definitions.GAMEDAY_DISABLED_AND_PRESALE.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      description: 'attributes.Notes_1'
    },
    visible: false,
    listMode: 'hide',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.GAMEDAY_POIS.id,
    title: Definitions.GAMEDAY_POIS.name,
    url: Definitions.GAMEDAY_POIS.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      description: 'attributes.Notes_1'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      minScale: 0
    }
  },
  {
    type: 'feature',
    id: Definitions.GAMEDAY_STRIPES.id,
    title: Definitions.GAMEDAY_STRIPES.name,
    url: Definitions.GAMEDAY_STRIPES.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    visible: true,
    listMode: 'hide',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.GAMEDAY_RNS_SPACES.id,
    title: Definitions.GAMEDAY_RNS_SPACES.name,
    url: Definitions.GAMEDAY_RNS_SPACES.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    visible: false,
    listMode: 'hide',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: Definitions.GAMEDAY_GRASS_MALL_AREAS.id,
    title: Definitions.GAMEDAY_GRASS_MALL_AREAS.name,
    url: Definitions.GAMEDAY_GRASS_MALL_AREAS.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.aNote'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.GAMEDAY_GET_TO_THE_GRID.id,
    title: Definitions.GAMEDAY_GET_TO_THE_GRID.name,
    url: Definitions.GAMEDAY_GET_TO_THE_GRID.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.SHOWDOWN_PRE_PAY.id,
    title: Definitions.SHOWDOWN_PRE_PAY.name,
    url: Definitions.SHOWDOWN_PRE_PAY.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.aNote'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.SHOWDOWN_PARKING_LOTS.id,
    title: Definitions.SHOWDOWN_PARKING_LOTS.name,
    url: Definitions.SHOWDOWN_PARKING_LOTS.url,
    popupComponent: EventPopups.GameDayMarkdownWDirectionsComponent,
    popupData: {
      name: 'attributes.LotNum',
      description: 'attributes.aNote'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.BUILDINGS.layerId,
    title: Definitions.BUILDINGS.name,
    url: Definitions.BUILDINGS.url,
    popupComponent: Definitions.BUILDINGS.popupComponent,
    listMode: 'hide',
    visible: true,
    native: {
      legendEnabled: false,
      outFields: ['*'],
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
    id: Definitions.CONSTRUCTION.layerId,
    title: Definitions.CONSTRUCTION.name,
    url: Definitions.CONSTRUCTION.url,
    popupComponent: Definitions.CONSTRUCTION.popupComponent,
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.POINTS_OF_INTEREST.layerId,
    title: Definitions.POINTS_OF_INTEREST.name,
    url: Definitions.POINTS_OF_INTEREST.url,
    popupComponent: Definitions.POINTS_OF_INTEREST.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/statue-icon.png',
          width: '20px',
          height: '30.2px'
        }
      }
    }
  },
  {
    type: 'feature',
    id: Definitions.SURFACE_LOTS.layerId,
    title: Definitions.SURFACE_LOTS.name,
    url: Definitions.SURFACE_LOTS.url,
    popupComponent: Definitions.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    visible: true,
    layerIndex: 1,
    native: {
      legendEnabled: false,
      outFields: ['*'],
      opacity: 0.001,
      labelingInfo: [
        {
          symbol: {
            type: 'text',
            color: [0, 0, 0, 0.001]
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: Definitions.VISITOR_PARKING.layerId,
    title: Definitions.VISITOR_PARKING.name,
    url: Definitions.VISITOR_PARKING.url,
    popupComponent: Definitions.VISITOR_PARKING.popupComponent,
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.ACESSIBLE_ENTRANCES.layerId,
    title: Definitions.ACESSIBLE_ENTRANCES.name,
    url: Definitions.ACESSIBLE_ENTRANCES.url,
    popupComponent: Definitions.ACESSIBLE_ENTRANCES.popupComponent,
    listMode: 'show',
    visible: false
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    visible: true,
    popupComponent: Definitions.BUILDINGS.popupComponent
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
    url: `${Definitions.BUILDINGS.url}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbrev', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName', 'BldgAbbrev'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbrev', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Definitions.BUILDINGS.popupComponent,
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
    popupComponent: 'BasePopupComponent',
    searchActive: false,
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
    source: 'all-parking',
    name: 'Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: false,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    searchActive: false
  },
  {
    source: 'one-parking',
    name: 'Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
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
    popupComponent: Definitions.BUILDINGS.popupComponent,
    searchActive: true
  },
  {
    source: 'parking-lot',
    name: 'Parking Lot',
    url: `${Connections.basemapUrl}/9`,
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
    color: [252, 227, 0, 0.655],
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
