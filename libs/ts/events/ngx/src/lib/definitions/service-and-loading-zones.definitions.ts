import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum SERVICE_LOADING_LAYERS {
  CONSTRUCTION = 'construction',
  SERVICE_SPACES = 'service-parking-spaces',
  LINE_PAINT = 'line-paint',
  SERVICE_LOTS = 'service-parking-lots',
  RNS_SPACES = 'rns-spaces'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const ServiceLoadingDefinitions = {
  CONSTRUCTION: {
    id: SERVICE_LOADING_LAYERS.CONSTRUCTION,
    layerId: SERVICE_LOADING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
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
    id: ServiceLoadingDefinitions.RNS_SPACES.id,
    title: ServiceLoadingDefinitions.RNS_SPACES.name,
    url: ServiceLoadingDefinitions.RNS_SPACES.url,
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

export const ServiceLoadingTs: ISpecialEventRoot = {
  configuration: ServiceLoadingConfiguration,
  options: ServiceLoadingOptions,
  sources: ServiceLoadingColdLayerSources,
  references: SERVICE_LOADING_LAYERS,
  discover: {
    id: ServiceLoadingConfiguration.id,
    name: ServiceLoadingConfiguration.name,
    description: 'Service and loading zone parking layers, including construction and RNS overlays.',
    source: 'internal',
    type: 'event',
    keywords: ['service', 'loading', 'parking']
  }
};
