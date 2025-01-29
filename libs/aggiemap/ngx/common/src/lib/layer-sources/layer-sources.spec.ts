import { IFactoryExcludeOptions } from '../utils/definitionFactory';
import { LayerSources } from './layer-sources';
import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';

describe('LayerSources', () => {
  let connections: IComposedConnections;
  let definitions: IComposedIDefinitions;
  let options: IFactoryExcludeOptions<IComposedIDefinitions>;

  beforeEach(() => {
    connections = {} as IComposedConnections;
    definitions = {
      BUILDINGS: { layerId: 'buildings', name: 'Buildings', url: 'buildings-url', popupComponent: 'buildings-popup' },
      CONSTRUCTION: {
        layerId: 'construction',
        name: 'Construction',
        url: 'construction-url',
        popupComponent: 'construction-popup'
      },
      POINTS_OF_INTEREST: { layerId: 'poi', name: 'Points of Interest', url: 'poi-url', popupComponent: 'poi-popup' },
      RESTROOMS: { layerId: 'restrooms', name: 'Restrooms', url: 'restrooms-url', popupComponent: 'restrooms-popup' },
      LACTATION_ROOMS: {
        layerId: 'lactation',
        name: 'Lactation Rooms',
        url: 'lactation-url',
        popupComponent: 'lactation-popup'
      },
      SURFACE_LOTS: {
        layerId: 'surface-lots',
        name: 'Surface Lots',
        url: 'surface-lots-url',
        popupComponent: 'surface-lots-popup'
      },
      VISITOR_PARKING: {
        layerId: 'visitor-parking',
        name: 'Visitor Parking',
        url: 'visitor-parking-url',
        popupComponent: 'visitor-parking-popup'
      },
      ACESSIBLE_ENTRANCES: {
        layerId: 'accessible-entrances',
        name: 'Accessible Entrances',
        url: 'accessible-entrances-url',
        popupComponent: 'accessible-entrances-popup'
      },
      EMERGENCY_PHONES: { layerId: 'emergency-phones', name: 'Emergency Phones', url: 'emergency-phones-url' },
      BIKE_LOCATIONS: { layerId: 'bike-locations', name: 'Bike Locations', url: 'bike-locations-url' }
    } as IComposedIDefinitions;
    options = { exclude: [] };
  });

  it('should return all layer sources when no options are provided', () => {
    const result = LayerSources(connections, definitions);
    expect(result.length).toBe(12);
  });

  it('should exclude specified layers', () => {
    options.exclude = ['BUILDINGS', 'CONSTRUCTION'];
    const result = LayerSources(connections, definitions, options);
    expect(result.length).toBe(10);
    expect(result.find((layer) => layer.id === 'buildings')).toBeUndefined();
    expect(result.find((layer) => layer.id === 'construction')).toBeUndefined();
  });

  it('should include all layers if exclude list is empty', () => {
    options.exclude = [];
    const result = LayerSources(connections, definitions, options);
    expect(result.length).toBe(12);
  });

  it('should return an empty array if all layers are excluded', () => {
    options.exclude = Object.keys(definitions) as Array<keyof IComposedIDefinitions>;
    const differenceExpected = options.exclude.length;

    const resultWithNoExclusions = LayerSources(connections, definitions);
    const resultWithExclusions = LayerSources(connections, definitions, options);

    expect(resultWithNoExclusions.length - resultWithExclusions.length).toBe(differenceExpected);
  });
});
