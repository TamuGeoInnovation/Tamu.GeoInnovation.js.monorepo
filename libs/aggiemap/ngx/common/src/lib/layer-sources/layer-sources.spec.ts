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
      BUILDINGS: {
        id: 'buildings',
        layerId: 'buildings',
        name: 'Buildings',
        url: 'buildings-url',
        popupComponent: 'buildings-popup'
      },
      CONSTRUCTION: {
        id: 'construction',
        layerId: 'construction',
        name: 'Construction',
        url: 'construction-url',
        popupComponent: 'construction-popup'
      },
      POINTS_OF_INTEREST: {
        id: 'poi',
        layerId: 'poi',
        name: 'Points of Interest',
        url: 'poi-url',
        popupComponent: 'poi-popup'
      },
      BONFIRE: {
        id: 'bonfire',
        layerId: 'bonfire',
        name: 'Bonfire',
        url: 'bonfire-url',
        popupComponent: 'bonfire-popup'
      },
      LACTATION_ROOMS: {
        id: 'lactation',
        layerId: 'lactation',
        name: 'Lactation Rooms',
        url: 'lactation-url',
        popupComponent: 'lactation-popup'
      },
      SURFACE_LOTS: {
        id: 'surface-lots',
        layerId: 'surface-lots',
        name: 'Surface Lots',
        url: 'surface-lots-url',
        popupComponent: 'surface-lots-popup'
      },
      VISITOR_PARKING: {
        id: 'visitor-parking',
        layerId: 'visitor-parking',
        name: 'Visitor Parking',
        url: 'visitor-parking-url',
        popupComponent: 'visitor-parking-popup'
      },
      TRANSPORTATION_PARKING: {
        id: 'transportation-parking',
        layerId: 'transportation-parking',
        name: 'Transportation Parking',
        url: 'transportation-parking-url',
        popupComponent: 'transportation-parking-popup'
      },
      ACESSIBLE_ENTRANCES: {
        id: 'accessible-entrances',
        layerId: 'accessible-entrances',
        name: 'Accessible Entrances',
        url: 'accessible-entrances-url',
        popupComponent: 'accessible-entrances-popup'
      },
      EMERGENCY_PHONES: {
        id: 'emergency-phones',
        layerId: 'emergency-phones',
        name: 'Emergency Phones',
        url: 'emergency-phones-url'
      },
      BIKE_RACKS: {
        id: 'bike-racks',
        layerId: 'bike-racks',
        name: 'Bike Racks',
        url: 'bike-racks-url'
      },
      BIKE_LOCATIONS: {
        id: 'bike-locations',
        layerId: 'bike-locations',
        name: 'Bike Locations',
        url: 'bike-locations-url'
      },
      DINING_LOCATIONS: {
        id: 'dining-locations',
        layerId: 'dining-locations',
        name: 'Dining Locations',
        url: 'dining-locations-url',
        popupComponent: 'dining-popup'
      },
      AGGIEPRINT_LOCATIONS: {
        id: 'aggieprint-locations',
        layerId: 'aggieprint-locations',
        name: 'AggiePrint Locations',
        url: 'aggieprint-locations-url',
        popupComponent: 'aggieprint-popup'
      },
      FAMILY_FRIENDLY_BATHROOMS: {
        id: 'family-friendly-bathrooms',
        layerId: 'family-friendly-bathrooms',
        name: 'Family Friendly Bathrooms',
        url: 'family-friendly-bathrooms-url',
        popupComponent: 'family-friendly-bathrooms-popup'
      }
    };
    options = { exclude: [] };
  });

  it('should return all layer sources when no options are provided', () => {
    const result = LayerSources(connections, definitions);

    expect(result.length).toBe(16);
  });

  it('should exclude specified layers', () => {
    options.exclude = ['BUILDINGS', 'CONSTRUCTION'];
    const result = LayerSources(connections, definitions, options);

    expect(result.length).toBe(14);
    expect(result.find((layer) => layer.id === 'buildings')).toBeUndefined();
    expect(result.find((layer) => layer.id === 'construction')).toBeUndefined();
  });

  it('should include all layers if exclude list is empty', () => {
    options.exclude = [];
    const result = LayerSources(connections, definitions, options);

    expect(result.length).toBe(16);
  });

  it('should retain only non-definition-backed top-level layers when all definitions are excluded', () => {
    options.exclude = Object.keys(definitions) as Array<keyof IComposedIDefinitions>;
    const resultWithExclusions = LayerSources(connections, definitions, options);

    expect(resultWithExclusions.map((layer) => layer.id)).toEqual([
      'selection-layer',
      'bus-route-layer',
      'sustainable-transportation-group-layer'
    ]);
  });
});
