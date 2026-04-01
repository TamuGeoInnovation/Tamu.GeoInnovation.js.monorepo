import { LayerSource } from '@tamu-gisc/common/types';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';
import { LayerSources } from './layer-sources';
import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';

jest.mock('@tamu-gisc/aggiemap/ngx/popups', () => ({
  Popups: {
    MarkdownPopupComponent: 'MarkdownPopupComponent'
  }
}));

type GroupLayerSource = Extract<LayerSource, { type: 'group' }>;

describe('LayerSources', () => {
  let connections: IComposedConnections;
  let definitions: IComposedIDefinitions;
  let options: IFactoryExcludeOptions<IComposedIDefinitions>;

  beforeEach(() => {
    connections = {
      tsMainUrl: 'https://example.com/arcgis/rest/services/TS/TS_Main/MapServer'
    } as IComposedConnections;
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

  it('should split shared bike racks into flat sustainable transportation child layers', () => {
    const result = LayerSources(connections, definitions);
    const sustainableTransportationGroup = result.find((layer) => layer.id === 'sustainable-transportation-group-layer') as
      | GroupLayerSource
      | undefined;
    const childSources = sustainableTransportationGroup?.sources ?? [];
    const childTitles = childSources.map((layer) => layer.title);
    const childIds = childSources.map((layer) => layer.id);

    expect(sustainableTransportationGroup?.type).toBe('group');
    expect(childTitles).toEqual([
      'EV Charge Stations (Main + RELLIS)',
      'Bike Fix Stations',
      'Bike Lanes',
      'City Bike Lanes and Routes',
      'Bike Racks',
      'Shared Mobility Racks',
      'Hub Corral',
      'Bike Dismount Zones'
    ]);
    expect(childIds).toEqual(
      expect.arrayContaining(['bike-racks-map-layer', 'shared-mobility-racks-layer', 'hub-corrals-layer'])
    );
    expect(childIds.filter((id) => id === 'bike-racks-map-layer')).toHaveLength(1);
  });

});
