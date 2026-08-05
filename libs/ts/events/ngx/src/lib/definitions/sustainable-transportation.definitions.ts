import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SUSTAINABLE_TRANSPORTATION_LAYERS {
  EV_CHARGERS = 'sustainable-transportation-ev-chargers',
  BIKE_RACKS = 'sustainable-transportation-bike-racks',
  BIKE_FIX_STATIONS = 'sustainable-transportation-bike-fix-stations',
  BIKE_LANES = 'sustainable-transportation-bike-lanes',
  CITY_BIKE_LANES_ROUTES = 'sustainable-transportation-city-bike-lanes-routes',
  BIKE_DISMOUNT_ZONES = 'sustainable-transportation-bike-dismount-zones',
}

const bikeLayersUrl = Connections.bikeMapUrl;

export const SustainableTransportationEvChargersLayerSource: LayerSource = {
  type: 'feature',
  id: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS,
  title: 'EV Charge Stations (Main + RELLIS)',
  url: `${bikeLayersUrl}/0`,
  visible: true,
  listMode: 'show',
  popupComponent: MarkdownPopupComponent,
  popupData: {
    name: '{attributes.EV_ID}',
    description:
      '<strong>Network</strong>: {attributes.EV_Network}\n' +
      '<strong>Charging Level</strong>: {attributes.Ch_Level}\n' +
      '<strong>Garage Level</strong>: {attributes.Garage_Lvl}\n' +
      '<strong>Notes</strong>: {attributes.EVCS_Notes}'
  },
  native: {
    outFields: ['*']
  }
};

export const SustainableTransportationDefinitions = {
  EV_CHARGERS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS,
    name: 'EV Charge Stations (Main + RELLIS)',
    url: `${bikeLayersUrl}/0`
  },
  BIKE_RACKS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    name: 'Bike Racks',
    url: `${bikeLayersUrl}/1`
  },
  BIKE_FIX_STATIONS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    name: 'Bike Fix Stations',
    url: `${bikeLayersUrl}/2`
  },
  BIKE_LANES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    name: 'Campus Bike Lanes',
    url: `${bikeLayersUrl}/3`
  },
  CITY_BIKE_LANES_ROUTES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    name: 'City Bike Lanes and Routes',
    url: `${bikeLayersUrl}/4`
  },
  BIKE_DISMOUNT_ZONES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    name: 'Dismount Zones',
    url: `${bikeLayersUrl}/5`
  }
};

export const SustainableTransportationColdLayerSources: LayerSource[] = [
  SustainableTransportationEvChargersLayerSource,
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_RACKS.id,
    title: SustainableTransportationDefinitions.BIKE_RACKS.name,
    url: SustainableTransportationDefinitions.BIKE_RACKS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description:
        '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' +
        '<strong>Notes</strong>: {attributes.BR_Notes}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.id,
    title: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.name,
    url: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Bike_Sta_Name}',
      description: '<strong>Amenities</strong>: {attributes.Bike_Amenities}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_LANES.id,
    title: SustainableTransportationDefinitions.BIKE_LANES.name,
    url: SustainableTransportationDefinitions.BIKE_LANES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Use_}',
      description: '<strong>Location</strong>: {attributes.Location}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.id,
    title: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.name,
    url: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: '<strong>Location</strong>: {attributes.Loc}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.id,
    title: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.name,
    url: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Name}',
      description: '<strong>Notes</strong>: {attributes.Bike_Notes}'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const SustainableTransportationConfiguration: EventConfiguration = {
  id: 'sustainable-transportation',
  name: 'Sustainable Transportation',
  applicationName: 'Sustainable Transportation Map',
  shortApplicationName: 'Sustainable Transportation',
  introductionText:
    'Explore bike amenities and EV charge stations across Main Campus and the RELLIS Campus in one map.',
  mapCenter: [-96.34643, 30.61313],
  eventDates: [],
  zoom: 15
};

export const SustainableTransportationOptions: SpecialEventOptions = [];

export const SustainableTransportationTs: AggiemapCustomMapConfiguration = {
  configuration: SustainableTransportationConfiguration,
  options: SustainableTransportationOptions,
  sources: SustainableTransportationColdLayerSources,
  references: SUSTAINABLE_TRANSPORTATION_LAYERS,
  type: 'general-map',
  discover: {
    id: SustainableTransportationConfiguration.id,
    name: SustainableTransportationConfiguration.name,
    description: 'Bike amenities and EV charging locations for Main Campus and the RELLIS Campus.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'general',
    keywords: [
      'sustainable transportation',
      'bike',
      'hub corral',
      'shared mobility',
      'bike racks',
      'bike fix stations',
      'bike lanes',
      'dismount zones',
      'ev',
      'ev chargers',
      'electric vehicle',
      'rellis'
    ]
  }
};
