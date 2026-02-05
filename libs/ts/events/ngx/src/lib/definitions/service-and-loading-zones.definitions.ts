import { LayerSource } from '@tamu-gisc/common/types';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SERVICE_LOADING_LAYERS {
  CONSTRUCTION = 'construction',
  MAINTENANCE_SPACES = 'maintenance-parking-spaces',
  SERVICE_SPACES = 'service-parking-spaces',
  LINE_PAINT = 'line-paint',
  MAINTENANCE_LOTS = 'maintenance-parking-lots',
  SERVICE_LOTS = 'service-parking-lots',
  RNS_SPACES = 'rns-spaces',
  CONTRACTOR_LOTS = 'contractor-parking-lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const ServiceLoadingDefinitions = {
  CONSTRUCTION: {
    id: SERVICE_LOADING_LAYERS.CONSTRUCTION,
    layerId: SERVICE_LOADING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  MAINTENANCE_SPACES: {
    id: SERVICE_LOADING_LAYERS.MAINTENANCE_SPACES,
    layerId: SERVICE_LOADING_LAYERS.MAINTENANCE_SPACES,
    name: 'Maintenance Parking Spaces',
    url: `${eventUrl}/1`
  },
  SERVICE_SPACES: {
    id: SERVICE_LOADING_LAYERS.SERVICE_SPACES,
    layerId: SERVICE_LOADING_LAYERS.SERVICE_SPACES,
    name: 'Service Parking Spaces',
    url: `${eventUrl}/2`
  },
  LINE_PAINT: {
    id: SERVICE_LOADING_LAYERS.LINE_PAINT,
    layerId: SERVICE_LOADING_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/3`
  },
  MAINTENANCE_LOTS: {
    id: SERVICE_LOADING_LAYERS.MAINTENANCE_LOTS,
    layerId: SERVICE_LOADING_LAYERS.MAINTENANCE_LOTS,
    name: 'Maintenance Parking Lots',
    url: `${eventUrl}/4`
  },
  SERVICE_LOTS: {
    id: SERVICE_LOADING_LAYERS.SERVICE_LOTS,
    layerId: SERVICE_LOADING_LAYERS.SERVICE_LOTS,
    name: 'Service Parking Lots',
    url: `${eventUrl}/5`
  },
  RNS_SPACES: {
    id: SERVICE_LOADING_LAYERS.RNS_SPACES,
    layerId: SERVICE_LOADING_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/6`
  },
  CONTRACTOR_LOTS: {
    id: SERVICE_LOADING_LAYERS.CONTRACTOR_LOTS,
    layerId: SERVICE_LOADING_LAYERS.CONTRACTOR_LOTS,
    name: 'Contractor Parking Lots',
    url: `${eventUrl}/7`
  }
};

export const ServiceLoadingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.CONSTRUCTION.id,
    title: ServiceLoadingDefinitions.CONSTRUCTION.name,
    url: ServiceLoadingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.MAINTENANCE_SPACES.id,
    title: ServiceLoadingDefinitions.MAINTENANCE_SPACES.name,
    url: ServiceLoadingDefinitions.MAINTENANCE_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.SERVICE_SPACES.id,
    title: ServiceLoadingDefinitions.SERVICE_SPACES.name,
    url: ServiceLoadingDefinitions.SERVICE_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.LINE_PAINT.id,
    title: ServiceLoadingDefinitions.LINE_PAINT.name,
    url: ServiceLoadingDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.MAINTENANCE_LOTS.id,
    title: ServiceLoadingDefinitions.MAINTENANCE_LOTS.name,
    url: ServiceLoadingDefinitions.MAINTENANCE_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.SERVICE_LOTS.id,
    title: ServiceLoadingDefinitions.SERVICE_LOTS.name,
    url: ServiceLoadingDefinitions.SERVICE_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.RNS_SPACES.id,
    title: ServiceLoadingDefinitions.RNS_SPACES.name,
    url: ServiceLoadingDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.CONTRACTOR_LOTS.id,
    title: ServiceLoadingDefinitions.CONTRACTOR_LOTS.name,
    url: ServiceLoadingDefinitions.CONTRACTOR_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const ServiceLoadingConfiguration: EventConfiguration = {
  id: 'service-loading',
  name: 'Service and Loading Zone Parking',
  applicationName: 'Service and Loading Zone Parking Map',
  shortApplicationName: 'Service & Loading',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const ServiceLoadingOptions: SpecialEventOptions = [];

export const ServiceLoadingTs: AggiemapCustomMapConfiguration = {
  configuration: ServiceLoadingConfiguration,
  options: ServiceLoadingOptions,
  sources: ServiceLoadingColdLayerSources,
  references: SERVICE_LOADING_LAYERS,
  type: 'general-map',
  discover: {
    id: ServiceLoadingConfiguration.id,
    name: ServiceLoadingConfiguration.name,
    description: 'Service, maintenance, and contractor parking lots and spaces, including construction and RNS overlays.',
    source: 'internal',
    type: 'parking',
    keywords: ['service', 'loading', 'maintenance', 'contractor', 'parking']
  }
};
