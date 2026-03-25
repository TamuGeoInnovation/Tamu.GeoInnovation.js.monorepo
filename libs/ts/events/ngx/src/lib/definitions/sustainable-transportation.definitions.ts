import { LayerSource } from '@tamu-gisc/common/types';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SUSTAINABLE_TRANSPORTATION_LAYERS {
  EV_CHARGERS_MAIN = 'sustainable-transportation-ev-chargers-main',
  EV_CHARGERS_RELLIS = 'sustainable-transportation-ev-chargers-rellis',
  HUB_CORRALS = 'sustainable-transportation-hub-corrals',
  SHARED_MOBILITY_RACKS = 'sustainable-transportation-shared-mobility-racks',
  BIKE_RACKS = 'sustainable-transportation-bike-racks',
  BIKE_FIX_STATIONS = 'sustainable-transportation-bike-fix-stations',
  BIKE_LANES = 'sustainable-transportation-bike-lanes',
  CITY_BIKE_LANES_ROUTES = 'sustainable-transportation-city-bike-lanes-routes',
  BIKE_DISMOUNT_ZONES = 'sustainable-transportation-bike-dismount-zones',
}

// Temporary bridge until the original TS server/editor workflow is restored.
// When that server is ready again, swap these URLs and the layer-id mapping in `SustainableTransportationDefinitions`
// back to the restored source services.
// These hosted view services mirror the secured Portal source layers while remaining queryable by the public app.
const evMainLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/EV_Charge_Stations_MC_view/FeatureServer';
const evRellisLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/EV_Charge_Stations_Rellis/FeatureServer';
const rackLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer';
const fixStationLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Fix_Stations_view/FeatureServer';
const bikeLaneLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Bike_Lanes_view/FeatureServer';
const dismountZoneLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Dismount_Zones_view/FeatureServer';

export const SustainableTransportationDefinitions = {
  EV_CHARGERS_MAIN: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_MAIN,
    name: 'EV Charge Stations (Main Campus)',
    url: `${evMainLayersUrl}/0`
  },
  EV_CHARGERS_RELLIS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_RELLIS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS_RELLIS,
    name: 'EV Charge Stations (RELLIS)',
    url: `${evRellisLayersUrl}/0`
  },
  HUB_CORRALS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
    name: 'Hub Corral',
    url: `${rackLayersUrl}/0`
  },
  SHARED_MOBILITY_RACKS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
    name: 'Shared Mobility Racks',
    url: `${rackLayersUrl}/1`
  },
  BIKE_RACKS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    name: 'Bike Racks',
    url: `${rackLayersUrl}/2`
  },
  BIKE_FIX_STATIONS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    name: 'Bike Fix Stations',
    url: `${fixStationLayersUrl}/0`
  },
  BIKE_LANES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    name: 'Bike Lanes',
    url: `${bikeLaneLayersUrl}/2`
  },
  CITY_BIKE_LANES_ROUTES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    name: 'City Bike Lanes and Routes',
    url: `${bikeLaneLayersUrl}/1`
  },
  BIKE_DISMOUNT_ZONES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    name: 'Bike Dismount Zones',
    url: `${dismountZoneLayersUrl}/0`
  }
};

export const SustainableTransportationColdLayerSources: LayerSource[] = [
  // Keep this source list aligned with the temporary URL/layer mapping above until the original services are restored.
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.EV_CHARGERS_MAIN.id,
    title: SustainableTransportationDefinitions.EV_CHARGERS_MAIN.name,
    url: SustainableTransportationDefinitions.EV_CHARGERS_MAIN.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.EV_CHARGERS_RELLIS.id,
    title: SustainableTransportationDefinitions.EV_CHARGERS_RELLIS.name,
    url: SustainableTransportationDefinitions.EV_CHARGERS_RELLIS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.HUB_CORRALS.id,
    title: SustainableTransportationDefinitions.HUB_CORRALS.name,
    url: SustainableTransportationDefinitions.HUB_CORRALS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.id,
    title: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.name,
    url: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_RACKS.id,
    title: SustainableTransportationDefinitions.BIKE_RACKS.name,
    url: SustainableTransportationDefinitions.BIKE_RACKS.url,
    visible: true,
    listMode: 'show',
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
