import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MAINTENANCE_PARKING_LAYERS {
  MAINTENANCE_SPACES = 'maintenance-parking-spaces',
  MAINTENANCE_LOTS = 'maintenance-parking-lots'
}

const eventUrl = Connections('gis.tamu.edu').maintenanceParkingUrl;

export const MaintenanceParkingDefinitions = {
  MAINTENANCE_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    name: 'Maintenance Parking Spaces',
    url: `${eventUrl}/0`
  },
  MAINTENANCE_LOTS: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    name: 'Maintenance Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const MaintenanceParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.id,
    title: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.name,
    url: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.LotName}',
      description: {
        field: 'Spc_Type',
        collapsed: true
      },
      spaceId: {
        field: 'Spc_ID_Num',
        collapsed: true
      },
      rns: {
        field: 'RNS_Num',
        collapsed: true
      },
      garageLevel: {
        field: 'Garage_Lvl',
        collapsed: true
      },
      note: {
        field: 'Anno_Type',
        collapsed: true
      }
    },
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
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.MainteN',
        collapsed: true
      },
      lotType: {
        field: 'GIS.TS.ParkingLots.LotType',
        collapsed: true
      }
    },
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

export const MaintenanceParkingTs: AggiemapCustomMapConfiguration = {
  configuration: MaintenanceParkingConfiguration,
  options: MaintenanceParkingOptions,
  sources: MaintenanceParkingColdLayerSources,
  references: MAINTENANCE_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: MaintenanceParkingConfiguration.id,
    name: MaintenanceParkingConfiguration.name,
    description: 'Maintenance parking lots and spaces.',
    source: 'internal',
    type: 'parking',
    keywords: ['maintenance', 'parking']
  }
};
