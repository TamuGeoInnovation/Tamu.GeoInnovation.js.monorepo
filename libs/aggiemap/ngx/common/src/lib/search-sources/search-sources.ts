import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export function SearchSources(
  connections: IComposedConnections,
  definitions: IComposedIDefinitions,
  options?: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap>
): Array<SearchSource> {
  const SEARCH_SOURCES: ComposedSearchSourcesKeyMap = {
    BUILDING: {
      source: 'building',
      name: 'Building',
      url: `${connections.basemapUrl}/1`,
      queryParams: {
        ...commonQueryParams,
        where: {
          keys: ['Number', 'BldgAbbr', 'BldgName'],
          operators: ['LIKE', 'LIKE', 'LIKE'],
          wildcards: ['includes', 'includes', 'includes'],
          transformations: ['UPPER', 'UPPER', 'UPPER']
        },
        scoringWhere: {
          keys: ['BldgName', 'BldgAbbr'],
          operators: ['LIKE', 'LIKE'],
          wildcards: ['startsWith', 'startsWith'],
          transformations: ['UPPER', 'UPPER']
        }
      },
      scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
      featuresLocation: 'features',
      displayTemplate: '{attributes.BldgName} ({attributes.Number})',
      popupComponent: Popups.BuildingPopupComponent,
      searchActive: true
    },
    BUILDING_EXACT: {
      source: 'building-exact',
      name: 'Building',
      url: `${connections.basemapUrl}/1`,
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
      searchActive: false,
      urlQueryParam: 'bldg',
      urlQueryParamAliases: ['Bldg', 'BldgAbbrv', 'bldgabbrv']
    },
    UNIVERSITY_DEPARTMENTS: {
      source: 'university-departments',
      name: 'University Departments',
      url: `${connections.departmentUrl}`,
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
    UNIVERSITY_DEPARTMENTS_EXACT: {
      source: 'university-departments-exact',
      name: 'University Departments',
      url: `${connections.departmentUrl}`,
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
    ALL_PARKING: {
      source: 'all-parking',
      name: 'Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
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
    VISITOR_PARKING: {
      source: 'visitor-parking',
      name: 'Visitor Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
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
    NIGHT_PARKING: {
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
    ONE_PARKING: {
      source: 'one-parking',
      name: 'Parking',
      url: `${definitions.TRANSPORTATION_PARKING.url}`,
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
    PARKING_GARAGE: {
      source: 'parking-garage',
      name: 'Parking Garage',
      url: `${connections.basemapUrl}/0`,
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
    PARKING_LOT: {
      source: 'parking-lot',
      name: 'Parking Lot',
      url: `${connections.basemapUrl}/9`,
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
      popupComponent: Popups.ParkingLotPopupComponent,
      searchActive: true,
      urlQueryParam: 'lot',
      urlQueryParamAliases: ['Lot']
    },
    POINTS_OF_INTEREST_EXACT: {
      source: 'points-of-interest-exact',
      name: 'Points of Interest',
      url: definitions.POINTS_OF_INTEREST.url,
      queryParams: {
        ...commonQueryParams,
        where: {
          keys: ['OBJECTID'],
          operators: ['=']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.name}',
      popupComponent: Popups.PoiPopupComponent,
      searchActive: false,
      urlQueryParam: 'poi',
      urlQueryParamAliases: ['POI']
    },
    POINTS_OF_INTEREST: {
      source: 'points-of-interest',
      name: 'Points of Interest',
      url: definitions.POINTS_OF_INTEREST.url,
      queryParams: {
        ...commonQueryParams,
        where: {
          keys: ['name'],
          operators: ['LIKE'],
          wildcards: ['includes'],
          transformations: ['UPPER']
        }
      },
      featuresLocation: 'features',
      displayTemplate: '{attributes.name}',
      popupComponent: Popups.PoiPopupComponent,
      searchActive: true
    },
    BIKE_RACKS: {
      source: 'bike-racks',
      name: 'Bike Racks',
      url: `${connections.bikeRacksUrl}`,
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
  };

  return Object.entries(SEARCH_SOURCES)
    .filter(([key]) => {
      if (options && options.exclude && options.exclude.length > 0) {
        const keyId = options.exclude.some((excludeKey) => {
          return key === excludeKey;
        });

        if (keyId) {
          return false;
        }
      }

      return true;
    })
    .map(([, value]) => {
      return value;
    });
}

export type ComposedSearchSourcesKeyMap = {
  BUILDING: SearchSource;
  BUILDING_EXACT: SearchSource;
  UNIVERSITY_DEPARTMENTS: SearchSource;
  UNIVERSITY_DEPARTMENTS_EXACT: SearchSource;
  ALL_PARKING: SearchSource;
  VISITOR_PARKING: SearchSource;
  NIGHT_PARKING: SearchSource;
  ONE_PARKING: SearchSource;
  PARKING_GARAGE: SearchSource;
  PARKING_LOT: SearchSource;
  POINTS_OF_INTEREST_EXACT: SearchSource;
  POINTS_OF_INTEREST: SearchSource;
  BIKE_RACKS: SearchSource;
};
