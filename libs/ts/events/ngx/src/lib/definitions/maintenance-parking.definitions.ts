import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MAINTENANCE_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  MAINTENANCE_SPACES = 'Maintenance Parking Spaces',
  SERVICE_SPACES = 'Service Parking Spaces',
  LINE_PAINT = 'Line Paint',
  MAINTENANCE_LOTS = 'Maintenance Parking Lots',
  SERVICE_LOTS = 'Service Parking Lots',
  RNS_SPACES = 'RNS Spaces',
  CONTRACTOR_LOTS = 'Contractor Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const MaintenanceParkingDefinitions = {
  CONSTRUCTION: {
    id: MAINTENANCE_PARKING_LAYERS.CONSTRUCTION,
    layerId: MAINTENANCE_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  MAINTENANCE_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    name: 'Maintenance Parking Spaces',
    url: `${eventUrl}/1`
  },
  SERVICE_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.SERVICE_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.SERVICE_SPACES,
    name: 'Service Parking Spaces',
    url: `${eventUrl}/2`
  },
  LINE_PAINT: {
    id: MAINTENANCE_PARKING_LAYERS.LINE_PAINT,
    layerId: MAINTENANCE_PARKING_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/3`
  },
  MAINTENANCE_LOTS: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    name: 'Maintenance Parking Lots',
    url: `${eventUrl}/4`
  },
  SERVICE_LOTS: {
    id: MAINTENANCE_PARKING_LAYERS.SERVICE_LOTS,
    layerId: MAINTENANCE_PARKING_LAYERS.SERVICE_LOTS,
    name: 'Service Parking Lots',
    url: `${eventUrl}/5`
  },
  RNS_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.RNS_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/6`
  },
  CONTRACTOR_LOTS: {
    id: MAINTENANCE_PARKING_LAYERS.CONTRACTOR_LOTS,
    layerId: MAINTENANCE_PARKING_LAYERS.CONTRACTOR_LOTS,
    name: 'Contractor Parking Lots',
    url: `${eventUrl}/7`
  }
};

export const MaintenanceParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.CONSTRUCTION.id,
    title: MaintenanceParkingDefinitions.CONSTRUCTION.name,
    url: MaintenanceParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.id,
    title: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.name,
    url: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.SERVICE_SPACES.id,
    title: MaintenanceParkingDefinitions.SERVICE_SPACES.name,
    url: MaintenanceParkingDefinitions.SERVICE_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.LINE_PAINT.id,
    title: MaintenanceParkingDefinitions.LINE_PAINT.name,
    url: MaintenanceParkingDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.id,
    title: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.name,
    url: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.SERVICE_LOTS.id,
    title: MaintenanceParkingDefinitions.SERVICE_LOTS.name,
    url: MaintenanceParkingDefinitions.SERVICE_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.RNS_SPACES.id,
    title: MaintenanceParkingDefinitions.RNS_SPACES.name,
    url: MaintenanceParkingDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.CONTRACTOR_LOTS.id,
    title: MaintenanceParkingDefinitions.CONTRACTOR_LOTS.name,
    url: MaintenanceParkingDefinitions.CONTRACTOR_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const MaintenanceParkingConfiguration: EventConfiguration = {
  id: 'maintenance-parking',
  name: 'Maintenance Parking',
  applicationName: 'Maintenance Parking Map',
  shortApplicationName: 'Maintenance Parking',
  mapCenter: [-96.34046, 30.60798],
  eventDates: [],
  zoom: 16
};

export const MaintenanceParkingOptions: SpecialEventOptions = [];

export const MaintenanceParkingTs: ISpecialEventRoot = {
  configuration: MaintenanceParkingConfiguration,
  options: MaintenanceParkingOptions,
  sources: MaintenanceParkingColdLayerSources,
  references: MAINTENANCE_PARKING_LAYERS,
  discover: {
    id: MaintenanceParkingConfiguration.id,
    name: MaintenanceParkingConfiguration.name,
    description: 'Maintenance parking lots and spaces, including construction, service, contractor, and RNS overlays.',
    source: 'internal',
    type: 'event',
    keywords: ['maintenance', 'parking', 'service', 'contractor']
  }
};
