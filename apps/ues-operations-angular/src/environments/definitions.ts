import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource } from '@tamu-gisc/common/types';

import esri = __esri;

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://fc-gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  bikeLocationsUrl: 'http://nodes.geoservices.tamu.edu/api/veoride/bikes/?format=geojson&metadata=false&fields=lat,lon'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`
  },
  DOMESTIC_COLD_WATER: {
    id: 'domestic-cold-water',
    layerId: 'domestic-cold-water-layer',
    name: 'Domestic Cold Water',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/1'
  },
  WELL_SITES: {
    id: 'well-sites',
    layerId: 'well-sites-layer',
    name: 'Well Sites',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/5'
  },
  FIRE_HYDRANTS: {
    id: 'fire-hydrants',
    layerId: 'fire-hydrants-layer',
    name: 'Fire Hydrants',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/6'
  },
  UES_NATURAL_GAS_METERS: {
    id: 'ues-natural-gas-meters',
    layerId: 'ues-natural-gas-meters-layer',
    name: 'UES Natural Gas Meters',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/29'
  },
  GENERATORS: {
    id: 'generator',
    layerId: 'generator-layer',
    name: 'Generators',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/38'
  },
  TRANSFORMER: {
    id: 'transformer',
    layerId: 'transformer-layer',
    name: 'Transformers',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/39'
  },
  ELECTRICAL_MANHOLES: {
    id: 'electrical-manholes',
    layerId: 'electrical-manholes-layer',
    name: 'Electrical Manholes',
    url: 'https://ues-arc.tamu.edu/arcgis/rest/services/Yoho/UES_Operations/MapServer/41'
  },
  POINTS_OF_INTEREST: {
    id: 'poi',
    layerId: 'poi-layer',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    popupComponent: Popups.PoiPopupComponent
  },
  RESTROOMS: {
    id: 'restrooms',
    layerId: 'restrooms-layer',
    name: 'Restrooms',
    url: `${Connections.inforUrl}/1`,
    popupComponent: Popups.RestroomPopupComponent
  },
  LACTATION_ROOMS: {
    id: 'lactation-rooms',
    layerId: 'lactation-rooms-layer',
    name: 'Lactation Rooms',
    url: `${Connections.inforUrl}/2`,
    popupComponent: Popups.LactationPopupComponent
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
  EMERGENCY_PHONES: {
    id: 'emergency-phones',
    layerId: 'emergency-phones-layer',
    name: 'Emergency Phones',
    url: `${Connections.inforUrl}/4`
  }
};

const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

const OAuthInfos = {
  ues: {
    info: {
      appId: 'L62AfPSK3ADzREz0',
      popup: false,
      portalUrl: 'https://pgis-arc-p1.apogee.tamu.edu/arcgis',
      preserveUrlHash: true,
      authNamespace: 'tamu'
    },
    forceCredentialFetch: true,
    overrideCredentialUrl: 'https://pgis-arc-p1.apogee.tamu.edu/arcgis/sharing'
  }
};

export const LayerSources: LayerSource[] = [
  {
    type: 'map-server',
    url: 'https://pgis-arc-p1.apogee.tamu.edu/arcgis/rest/services/Production_UES_Operations_Map/MapServer',
    id: 'ues-map-server',
    title: 'UES Operations',
    visible: false,
    auth: OAuthInfos.ues,
    native: {
      defaultFeatureLayerProperties: {
        visible: false,
        popupComponent: Popups.BaseDirectionsComponent,
        outFields: ['*']
      }
    }
  },
  {
    type: 'feature',
    id: 'fiber-paths-layer',
    title: 'IT Fiber Paths',
    url: 'https://pgis-arc-p1.apogee.tamu.edu/arcgis/rest/services/Hosted/Fiber_Paths_UES/FeatureServer/1',
    visible: false,
    popupComponent: Popups.BasePopupComponent,
    auth: OAuthInfos.ues,
    native: { ...commonLayerProps }
  },
  {
    type: 'group',
    id: 'aggiemap-layers',
    title: 'Aggiemap',
    native: {},
    sources: [
      {
        type: 'feature',
        id: Definitions.BUILDINGS.layerId,
        title: Definitions.BUILDINGS.name,
        url: Definitions.BUILDINGS.url,
        popupComponent: Popups.BuildingPopupComponent,
        listMode: 'hide',
        visible: true,
        native: {
          ...commonLayerProps,
          legendEnabled: false,
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
        id: 'construction-layer',
        title: 'Construction Zone',
        url: `${Connections.constructionUrl}`,
        listMode: 'show',
        visible: true,
        popupComponent: Popups.ConstructionPopupComponent,
        native: {
          ...commonLayerProps
        }
      },
      {
        type: 'feature',
        id: 'accessible-entrances-layer',
        title: 'Accessible Entrances',
        url: `${Connections.accessibleUrl}`,
        listMode: 'show',
        visible: false,
        popupComponent: Popups.AccessiblePopupComponent,
        native: {
          ...commonLayerProps
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
          ...commonLayerProps
        }
      },
      {
        type: 'feature',
        id: Definitions.RESTROOMS.layerId,
        title: Definitions.RESTROOMS.name,
        url: Definitions.RESTROOMS.url,
        popupComponent: Definitions.RESTROOMS.popupComponent,
        listMode: 'show',
        visible: false,
        native: {
          ...commonLayerProps
        }
      },
      {
        type: 'feature',
        id: Definitions.LACTATION_ROOMS.layerId,
        title: Definitions.LACTATION_ROOMS.name,
        url: Definitions.LACTATION_ROOMS.url,
        popupComponent: Definitions.LACTATION_ROOMS.popupComponent,
        listMode: 'show',
        visible: false,
        native: {
          ...commonLayerProps
        }
      },
      {
        type: 'feature',
        id: Definitions.VISITOR_PARKING.layerId,
        title: Definitions.VISITOR_PARKING.name,
        url: Definitions.VISITOR_PARKING.url,
        popupComponent: Definitions.VISITOR_PARKING.popupComponent,
        listMode: 'show',
        visible: false,
        native: {
          ...commonLayerProps
        }
      },
      {
        type: 'feature',
        id: Definitions.EMERGENCY_PHONES.layerId,
        title: Definitions.EMERGENCY_PHONES.name,
        url: Definitions.EMERGENCY_PHONES.url,
        listMode: 'show',
        visible: false,
        native: {
          ...commonLayerProps
        }
      }
    ]
  },
  {
    type: 'group',
    id: 'transportation-layers',
    title: 'Transportation',
    native: {},
    sources: [
      {
        type: 'group',
        id: 'ts-Bus',
        title: 'Bus',
        visible: false,
        sources: [
          {
            type: 'feature',
            id: 'ts-bus-stop-start-points-layer',
            title: 'Route Stop/Start Points',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/1`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-bus-campus-stops-layer',
            title: 'Campus Stops',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/2`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          }
        ]
      },
      {
        type: 'group',
        id: 'ts-bikes',
        title: 'Bicycle',
        visible: false,
        sources: [
          {
            type: 'feature',
            id: 'ts-bicycle-lanes-layer',
            title: 'Lanes',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/4`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-bicycle-racks-layer',
            title: 'Racks',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          }
        ]
      },
      {
        type: 'group',
        id: 'ts-move-in-out',
        title: 'Move-In & Move-Out',
        visible: false,
        sources: [
          {
            type: 'feature',
            id: 'ts-moveing-no-parking-areas-layer',
            title: 'No Parking Areas',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/1`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-movein-pois-layer',
            title: 'Move-In Points of Interest',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/2`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-moveout-street-parking-layer',
            title: 'Move-Out Allowed Street Parking',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/4`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-movein-streets-layer',
            title: 'Move-In Streets',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/5`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-movein-lots-layer',
            title: 'Move-In Lots',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/6`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          },
          {
            type: 'feature',
            id: 'ts-moveout-lots-layer',
            title: 'Move-Out Lots',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer/7`,
            listMode: 'show',

            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps
            }
          }
        ]
      },
      {
        type: 'group',
        id: 'ts-gameday',
        title: 'Game Day Parking',
        visible: false,
        sources: [
          {
            type: 'group',
            id: 'ts-gameday-thurs-layer',
            title: 'Thursday',
            sources: [
              {
                type: 'feature',
                id: 'ts-gameday-thurs-parking-layer',
                title: 'Parking Lots',
                url: `https://gis.tamu.edu/arcgis/rest/services/TS/ThursdayFootball/MapServer/5`,
                listMode: 'show',
                popupComponent: Popups.BasePopupComponent,
                native: {
                  ...commonLayerProps
                }
              },
              {
                type: 'feature',
                id: 'ts-gameday-thurs-grass-areas-layer',
                title: 'Street/Grass Areas',
                url: `https://gis.tamu.edu/arcgis/rest/services/TS/ThursdayFootball/MapServer/6`,
                listMode: 'show',
                popupComponent: Popups.BasePopupComponent,
                native: {
                  ...commonLayerProps
                }
              }
            ]
          },
          {
            type: 'group',
            id: 'ts-gameday-sat-layer',
            title: 'Saturday',
            sources: [
              {
                type: 'feature',
                id: 'ts-gameday-sat-parking-layer',
                title: 'Parking Lots',
                url: `https://gis.tamu.edu/arcgis/rest/services/TS/TSFootball/MapServer/5`,
                listMode: 'show',
                popupComponent: Popups.BasePopupComponent,
                native: {
                  ...commonLayerProps
                }
              },
              {
                type: 'feature',
                id: 'ts-gameday-sat-grass-areas-layer',
                title: 'Street/Grass Areas',
                url: `https://gis.tamu.edu/arcgis/rest/services/TS/TSFootball/MapServer/6`,
                listMode: 'show',
                popupComponent: Popups.BasePopupComponent,
                native: {
                  ...commonLayerProps
                }
              }
            ]
          }
        ]
      },
      {
        type: 'group',
        id: 'ts-parking-spaces',
        title: 'Parking Spaces',
        visible: false,
        sources: [
          {
            type: 'feature',
            id: 'ts-parking-spaces-accessible-layer',
            title: 'Reserved',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/7`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps,
              definitionExpression: 'HC_Type IS NULL AND DeptSpc_YN = 0',
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'simple-marker',
                  style: 'circle',
                  color: 'black',
                  size: 5
                }
              }
            }
          },
          {
            type: 'feature',
            id: 'ts-parking-spaces-dept-space-layer',
            title: 'Department Space',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/7`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps,
              definitionExpression: 'DeptSpc_YN = 1',
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'simple-marker',
                  style: 'circle',
                  color: 'red',
                  size: 5
                }
              }
            }
          },
          {
            type: 'feature',
            id: 'ts-parking-spaces-accessible-layer',
            title: 'Accessible',
            url: `https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer/7`,
            listMode: 'show',
            popupComponent: Popups.BasePopupComponent,
            native: {
              ...commonLayerProps,
              definitionExpression: 'HC_Type IS NOT null',
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'simple-marker',
                  style: 'circle',
                  color: 'blue',
                  size: 5
                }
              }
            }
          }
        ]
      }
    ]
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    visible: true,
    popupComponent: Popups.BuildingPopupComponent,
    native: {
      ...commonLayerProps
    }
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
        keys: ['Number', 'BldgAbbr', 'BldgName'],
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
    scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
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
    popupComponent: Popups.BaseDirectionsComponent,
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
    source: 'all-parking',
    name: 'Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.Visitor_H_C
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
    source: 'visitor-parking',
    name: 'Visitor Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.ParkingLots.LotType
      `,
      where: {
        keys: ['GIS.TS.ParkingLots.LotType', 'GIS.TS.ParkingLots.LotType'],
        operators: ['=', '=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    searchActive: false
  },
  {
    source: 'night-parking',
    name: 'Night Parking',
    url: `https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer/6`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.Lot_Use.Night_Lot`,
      where: {
        keys: ['Night_Lot'],
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
      GIS.TS.SpacePnt_Count.UB`
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
  },
  {
    source: Definitions.FIRE_HYDRANTS.id,
    name: Definitions.FIRE_HYDRANTS.name,
    url: Definitions.FIRE_HYDRANTS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.HYDR_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['HYDR_NUMBER', 'ASSETNUM '],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.GENERATORS.id,
    name: Definitions.GENERATORS.name,
    url: Definitions.GENERATORS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.UES_ID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['UES_ID', 'AIM_ASSET_NUMBER'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.TRANSFORMER.id,
    name: Definitions.TRANSFORMER.name,
    url: Definitions.TRANSFORMER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.UESID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['UESID', 'AIMNumber'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    }
  },
  {
    source: Definitions.ELECTRICAL_MANHOLES.id,
    name: Definitions.ELECTRICAL_MANHOLES.name,
    url: Definitions.ELECTRICAL_MANHOLES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.MH_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['MH_NUMBER'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.ELECTRICAL_MANHOLES.id,
    name: Definitions.ELECTRICAL_MANHOLES.name,
    url: Definitions.ELECTRICAL_MANHOLES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.MH_NUMBER}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['MH_NUMBER'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.DOMESTIC_COLD_WATER.id,
    name: Definitions.DOMESTIC_COLD_WATER.name,
    url: Definitions.DOMESTIC_COLD_WATER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.OBJECTID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['OBJECTID'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.DOMESTIC_COLD_WATER.id,
    name: Definitions.DOMESTIC_COLD_WATER.name,
    url: Definitions.DOMESTIC_COLD_WATER.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.OBJECTID}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['OBJECTID'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.UES_NATURAL_GAS_METERS.id,
    name: Definitions.UES_NATURAL_GAS_METERS.name,
    url: Definitions.UES_NATURAL_GAS_METERS.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.Meter_Number}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Meter_Number'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
  },
  {
    source: Definitions.WELL_SITES.id,
    name: Definitions.WELL_SITES.name,
    url: Definitions.WELL_SITES.url,
    featuresLocation: 'features',
    displayTemplate: '{attributes.WELL_NAME}',
    popupComponent: Popups.BaseDirectionsComponent,
    searchActive: true,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['WELL_NAME'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    }
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
