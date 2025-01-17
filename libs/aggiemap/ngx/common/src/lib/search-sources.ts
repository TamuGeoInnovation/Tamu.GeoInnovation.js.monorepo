import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { IComposedConnections } from './connections';
import { IComposedIDefinitions } from './definitions';

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export function SearchSources(connections: IComposedConnections, definitions: IComposedIDefinitions): Array<SearchSource> {
  return [
    {
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
    {
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
      searchActive: false
    },
    {
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
    {
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
    {
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
    {
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
    {
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
    {
      source: 'parking-lot',
      name: 'Parking Lot',
      url: `${connections.basemapUrl}/9`,
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
    {
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
  ];
}
