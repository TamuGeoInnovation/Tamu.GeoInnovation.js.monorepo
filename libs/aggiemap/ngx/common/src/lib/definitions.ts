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
      name: 'Construction Zone',
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
      name: 'Aggieprint Locations',
      url: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/TAMUPrinters/FeatureServer/0',
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
    },
    FAMILY_FRIENDLY_BATHROOMS: {
      id: 'family-friendly-bathrooms-locations',
      layerId: 'family-friendly-bathrooms-locations-layer',
      name: 'Family Friendly Bathroom Locations',
      url: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/1',
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
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
  FAMILY_FRIENDLY_BATHROOMS: IDefinition;
}
