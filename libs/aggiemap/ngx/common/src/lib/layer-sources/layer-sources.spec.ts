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
      SINGLE_OCCUPANCY_RESTROOMS: {
        id: 'single-occupancy-restroom-locations',
        layerId: 'single-occupancy-restroom-locations',
        name: 'Single Occupancy Restroom Locations',
        url: 'single-occupancy-restroom-locations-url',
        popupComponent: 'single-occupancy-restroom-locations-popup'
      },
      RNS_SPACES: {
        id: 'rns-spaces',
        layerId: 'rns-spaces',
        name: 'RNS Spaces',
        url: 'rns-spaces-url'
      },
      BIKE_DISMOUNT_ZONES: {
        id: 'bike-dismount-zones',
        layerId: 'bike-dismount-zones',
        name: 'Bike Dismount Zones',
        url: 'bike-dismount-zones-url'
      },
      CITY_BIKE_LANES_ROUTES: {
        id: 'city-bike-lanes-routes',
        layerId: 'city-bike-lanes-routes',
        name: 'City Bike Lanes and Routes',
        url: 'city-bike-lanes-routes-url'
      },
      CAMPUS_BIKE_LANES: {
        id: 'campus-bike-lanes',
        layerId: 'campus-bike-lanes',
        name: 'Campus Bike Lanes',
        url: 'campus-bike-lanes-url'
      },
      BIKE_FIX_STATIONS: {
        id: 'bike-fix-stations',
        layerId: 'bike-fix-stations',
        name: 'Bike Fix Stations',
        url: 'bike-fix-stations-url'
      },
      BIKE_RACKS_MAP: {
        id: 'bike-racks-map',
        layerId: 'bike-racks-map',
        name: 'Bike Racks',
        url: 'bike-racks-map-url'
      },
      EV_CHARGE_STATIONS: {
        id: 'ev-charge-stations',
        layerId: 'ev-charge-stations',
        name: 'EV Charge Stations',
        url: 'ev-charge-stations-url'
      },
      EVENT_150_OPENING_EVENT_LOCATIONS: {
        id: 'event-150-opening-event-locations',
        layerId: 'event-150-opening-event-locations',
        name: 'Event Locations',
        url: 'opening-ceremony-url/0'
      },
      EVENT_150_OPENING_SHUTTLE_ROUTE: {
        id: 'event-150-opening-shuttle-route',
        layerId: 'event-150-opening-shuttle-route',
        name: 'Shuttle Route',
        url: 'opening-ceremony-url/1'
      },
      EVENT_150_OPENING_PARKING: {
        id: 'event-150-opening-parking',
        layerId: 'event-150-opening-parking',
        name: 'Parking',
        url: 'opening-ceremony-url/2'
      },
      EVENT_150_KICKOFF_AT_KYLE: {
        id: 'event-150-kickoff-at-kyle',
        layerId: 'event-150-kickoff-at-kyle',
        name: 'Kickoff at Kyle',
        url: 'kickoff-at-kyle-url'
      },
      EVENT_150_LIVE_AT_THE_STATION: {
        id: 'event-150-live-at-the-station',
        layerId: 'event-150-live-at-the-station',
        name: 'Live at the Station',
        url: 'live-at-the-station-url'
      },
      EVENT_150_SPIRIT_WEEK: {
        id: 'event-150-spirit-week',
        layerId: 'event-150-spirit-week',
        name: 'Spirit of 150 Week',
        url: 'spirit-of-150-week-url'
      }
    };
    options = { exclude: [] };
  });

  it('should return all layer sources when no options are provided', () => {
    const result = LayerSources(connections, definitions);

    expect(result.length).toBe(18);
  });

  it('should exclude specified layers', () => {
    options.exclude = ['BUILDINGS', 'CONSTRUCTION'];
    const result = LayerSources(connections, definitions, options);

    expect(result.length).toBe(16);
    expect(result.find((layer) => layer.id === 'buildings')).toBeUndefined();
    expect(result.find((layer) => layer.id === 'construction')).toBeUndefined();
  });

  it('should include all layers if exclude list is empty', () => {
    options.exclude = [];
    const result = LayerSources(connections, definitions, options);

    expect(result.length).toBe(18);
  });

  it('should retain only non-definition-backed top-level layers when all definitions are excluded', () => {
    options.exclude = Object.keys(definitions) as Array<keyof IComposedIDefinitions>;
    const resultWithExclusions = LayerSources(connections, definitions, options);

    expect(resultWithExclusions.map((layer) => layer.id)).toEqual([
      'selection-layer',
      'bus-route-layer',
      'sustainable-transportation-group-layer',
      'event-150-group-layer'
    ]);
  });

  it('should list the 150th event sets under a heading, each off by default, in list order', () => {
    const result = LayerSources(connections, definitions);
    const eventsGroup = result.find((layer) => layer.id === 'event-150-group-layer') as GroupLayerSource | undefined;
    const children = eventsGroup?.sources ?? [];
    const openingCeremony = children.find((layer) => layer.id === 'event-150-opening-ceremony-group-layer') as
      | GroupLayerSource
      | undefined;

    expect(eventsGroup?.type).toBe('group');
    expect(eventsGroup?.title).toBe('150th Events');
    expect(eventsGroup?.listHeading).toBe(true);
    expect(children.every((layer) => layer.visible === false)).toBe(true);

    // Opening Ceremony is one list entry that toggles all three of its layers together.
    expect(openingCeremony?.native?.listMode).toBe('hide-children');

    // Esri's layer list shows a group's children in reverse source order, so reversing the sources
    // gives the order visitors see.
    expect([...children].reverse().map((layer) => layer.title)).toEqual([
      'Opening Ceremony',
      'Kickoff at Kyle',
      'Live at the Station',
      'Spirit of 150 Week'
    ]);
    expect([...(openingCeremony?.sources ?? [])].reverse().map((layer) => layer.title)).toEqual([
      'Event Locations',
      'Shuttle Route',
      'Parking'
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
      'Bike Dismount Zones',
      'City Bike Lanes and Routes',
      'Campus Bike Lanes',
      'Bike Fix Stations',
      'Bike Racks',
      'EV Charge Stations'
    ]);
    expect(childIds).toEqual(
      expect.arrayContaining([
        'bike-dismount-zones',
        'city-bike-lanes-routes',
        'campus-bike-lanes',
        'bike-fix-stations',
        'bike-racks-map',
        'ev-charge-stations'
      ])
    );
    expect(childIds.filter((id) => id === 'bike-racks-map')).toHaveLength(1);
  });
});
