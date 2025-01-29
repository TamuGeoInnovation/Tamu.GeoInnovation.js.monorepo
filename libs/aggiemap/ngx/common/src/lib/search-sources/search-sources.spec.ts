import { ComposedSearchSourcesKeyMap, SearchSources } from './search-sources';
import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

describe('SearchSources', () => {
  const connections: IComposedConnections = {
    basemapUrl: 'https://example.com/basemap',
    departmentUrl: 'https://example.com/department',
    bikeRacksUrl: 'https://example.com/bike-racks',
    accessibleUrl: 'https://example.com/accessible',
    bikeLocationsUrl: 'https://example.com/bike-locations',
    constructionUrl: 'https://example.com/construction',
    inforUrl: 'https://example.com/infor',
    tsMainUrl: 'https://example.com/ts-main'
  };

  const definitions: IComposedIDefinitions = {
    TRANSPORTATION_PARKING: {
      id: 'transportation-parking',
      layerId: 'transportation-parking-layer',
      name: 'Transportation Parking',
      url: 'https://example.com/parking'
    },
    POINTS_OF_INTEREST: {
      id: 'poi',
      layerId: 'poi-layer',
      name: 'Points of Interest',
      url: 'https://example.com/poi'
    },
    RESTROOMS: {
      id: 'restrooms',
      layerId: 'restrooms-layer',
      name: 'Restrooms',
      url: 'https://example.com/restrooms'
    },
    BUILDINGS: {
      id: 'buildings',
      layerId: 'buildings-layer',
      name: 'Buildings',
      url: 'https://example.com/buildings'
    },
    BIKE_RACKS: {
      id: 'bike-racks',
      layerId: 'bike-racks-layer',
      name: 'Bike Racks',
      url: 'https://example.com/bike-racks'
    },
    ACESSIBLE_ENTRANCES: {
      id: 'accessible-entrances',
      layerId: 'accessible-entrances-layer',
      name: 'Accessible Entrances',
      url: 'https://example.com/accessible-entrances'
    },
    EMERGENCY_PHONES: {
      id: 'emergency-phones',
      layerId: 'emergency-phones-layer',
      name: 'Emergency Phones',
      url: 'https://example.com/emergency-phones'
    },
    VISITOR_PARKING: {
      id: 'visitor-parking',
      layerId: 'visitor-parking-layer',
      name: 'Visitor Parking',
      url: 'https://example.com/visitor-parking'
    },
    SURFACE_LOTS: {
      id: 'surface-lots',
      layerId: 'surface-lots-layer',
      name: 'Surface Lots',
      url: 'https://example.com/surface-lots'
    },
    LACTATION_ROOMS: {
      id: 'lactation-rooms',
      layerId: 'lactation-rooms-layer',
      name: 'Lactation Rooms',
      url: 'https://example'
    },
    CONSTRUCTION: {
      id: 'construction',
      layerId: 'construction-layer',
      name: 'Construction',
      url: 'https://example.com/construction'
    },
    BIKE_LOCATIONS: {
      id: 'bike-locations',
      layerId: 'bike-locations-layer',
      name: 'Bike Locations',
      url: 'https://example.com/bike-locations'
    }
  };

  it('should return all search sources when no options are provided', () => {
    const result = SearchSources(connections, definitions);
    expect(result.length).toBe(12); // Ensure the number of search sources matches
  });

  it('should exclude specified search sources', () => {
    const options: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap> = {
      exclude: ['BUILDING', 'BIKE_RACKS']
    };
    const result = SearchSources(connections, definitions, options);
    expect(result.length).toBe(10); // Ensure the number of search sources matches after exclusion
    expect(result.find((source) => source.source === 'building')).toBeUndefined();
    expect(result.find((source) => source.source === 'bike-racks')).toBeUndefined();
  });

  it('should include all search sources if exclude list is empty', () => {
    const options: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap> = {
      exclude: []
    };
    const result = SearchSources(connections, definitions, options);
    expect(result.length).toBe(12); // Ensure the number of search sources matches
  });

  it('should return an empty array if all search sources are excluded', () => {
    const options: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap> = {
      exclude: [
        'BUILDING',
        'BUILDING_EXACT',
        'UNIVERSITY_DEPARTMENTS',
        'UNIVERSITY_DEPARTMENTS_EXACT',
        'ALL_PARKING',
        'VISITOR_PARKING',
        'NIGHT_PARKING',
        'ONE_PARKING',
        'PARKING_GARAGE',
        'PARKING_LOT',
        'POINTS_OF_INTEREST',
        'BIKE_RACKS'
      ]
    };

    const result = SearchSources(connections, definitions, options);
    expect(result.length).toBe(0); // Ensure the number of search sources matches
  });
});
