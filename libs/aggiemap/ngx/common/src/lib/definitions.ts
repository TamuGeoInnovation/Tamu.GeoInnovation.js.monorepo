import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { IComposedConnections } from './connections';

export function Definitions(Connections: IComposedConnections): IComposedIDefinitions {
  return {
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
      name: 'Construction Zones',
      url: `${Connections.constructionUrl}`,
      popupComponent: Popups.ConstructionPopupComponent
    },
    POINTS_OF_INTEREST: {
      id: 'poi',
      layerId: 'poi-layer',
      name: 'Points of Interest',
      url: `${Connections.poiUrl}/0`,
      popupComponent: Popups.PoiPopupComponent
    },
    BONFIRE: {
      id: 'bonfire',
      layerId: 'bonfire-layer',
      name: 'Bonfire Memorial',
      url: `${Connections.poiUrl}/1`,
      popupComponent: Popups.BonfirePopupComponent
    },
    LACTATION_ROOMS: {
      id: 'lactation-rooms',
      layerId: 'lactation-rooms-layer',
      name: 'Lactation Rooms',
      url: `${Connections.inforUrl}/2`,
      popupComponent: Popups.LactationPopupComponent
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
      name: 'Accessible Building Entrances',
      url: `${Connections.accessibleUrl}`,
      popupComponent: Popups.AccessiblePopupComponent
    },
    EMERGENCY_PHONES: {
      id: 'emergency-phones',
      layerId: 'emergency-phones-layer',
      name: 'Emergency Phones',
      url: `${Connections.inforUrl}/4`
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
    DINING_LOCATIONS: {
      id: 'dining-locations',
      layerId: 'dining-locations-layer',
      name: 'Dining Locations',
      url: `${Connections.diningLocationsUrl}`,
      popupComponent: Popups.DiningPopupComponent
    },
    AGGIEPRINT_LOCATIONS: {
      id: 'aggieprint-locations',
      layerId: 'aggieprint-locations-layer',
      name: 'AggiePrint Locations',
      url: `${Connections.aggiePrintUrl}/0`,
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
    },
    SINGLE_OCCUPANCY_RESTROOMS: {
      id: 'single-occupancy-restroom-locations',
      layerId: 'single-occupancy-restroom-locations-layer',
      name: 'Single Occupancy Restroom Locations',
      url: `${Connections.inforUrl}/1`,
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
    },
    BIKE_DISMOUNT_ZONES: {
      id: 'bike-dismount-zones',
      layerId: 'bike-dismount-zones-layer',
      name: 'Dismount Zones',
      url: `${Connections.bikeMapUrl}/5`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    CITY_BIKE_LANES_ROUTES: {
      id: 'city-bike-lanes-routes',
      layerId: 'city-bike-lanes-routes-layer',
      name: 'City Bike Lanes and Routes',
      url: `${Connections.bikeMapUrl}/4`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    CAMPUS_BIKE_LANES: {
      id: 'campus-bike-lanes',
      layerId: 'bike-lanes-layer',
      name: 'Campus Bike Lanes',
      url: `${Connections.bikeMapUrl}/3`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    BIKE_FIX_STATIONS: {
      id: 'bike-fix-stations',
      layerId: 'bike-fix-stations-layer',
      name: 'Bike Fix Stations',
      url: `${Connections.bikeMapUrl}/2`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    BIKE_RACKS_MAP: {
      id: 'bike-racks-map',
      layerId: 'bike-racks-map-layer',
      name: 'Bike Racks',
      url: `${Connections.bikeMapUrl}/1`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    EV_CHARGE_STATIONS: {
      id: 'ev-charge-stations',
      layerId: 'ev-charge-stations-layer',
      name: 'EV Charge Stations (Main + RELLIS)',
      url: `${Connections.bikeMapUrl}/0`,
      popupComponent: Popups.MarkdownPopupComponent
    }
  };
}

export interface IDefinition {
  id: string;
  layerId: string;
  name: string;
  url: string;
  popupComponent?: unknown;
}

export interface IComposedIDefinitions {
  BUILDINGS: IDefinition;
  CONSTRUCTION: IDefinition;
  POINTS_OF_INTEREST: IDefinition;
  BONFIRE: IDefinition;
  LACTATION_ROOMS: IDefinition;
  SURFACE_LOTS: IDefinition;
  VISITOR_PARKING: IDefinition;
  TRANSPORTATION_PARKING: IDefinition;
  ACESSIBLE_ENTRANCES: IDefinition;
  EMERGENCY_PHONES: IDefinition;
  BIKE_RACKS: IDefinition;
  BIKE_LOCATIONS: IDefinition;
  DINING_LOCATIONS: IDefinition;
  AGGIEPRINT_LOCATIONS: IDefinition;
  SINGLE_OCCUPANCY_RESTROOMS: IDefinition;
  BIKE_DISMOUNT_ZONES: IDefinition;
  CITY_BIKE_LANES_ROUTES: IDefinition;
  CAMPUS_BIKE_LANES: IDefinition;
  BIKE_FIX_STATIONS: IDefinition;
  BIKE_RACKS_MAP: IDefinition;
  EV_CHARGE_STATIONS: IDefinition;
}
