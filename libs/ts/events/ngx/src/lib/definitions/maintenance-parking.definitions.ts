import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum MAINTENANCE_PARKING_LAYERS {
  MAINTENANCE_SPACES = 'maintenance-parking-spaces',
  MAINTENANCE_LOTS = 'maintenance-parking-lots'
}

const eventUrl = Connections.maintenanceParkingUrl;

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
    url: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    // The markdown popup reads only `name` and `description`, so the space's id, RNS number and level are composed into
    // its description, after its type; resolved into keys of their own they were never shown (#3808). A row whose field
    // is blank is left out. The templates come last: each entry reads only the ones resolved before it.
    popupDataResolutionStrategy: 'cumulative',
    popupData: {
      spaceType: {
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
      },
      name: '{attributes.LotName}',
      description: `{attributes.spaceType}\nSpace: {attributes.spaceId}\nRNS number: {attributes.rns}\nLevel: {attributes.garageLevel}`
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.id,
    url: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    // The lot's type ("Surface", "Garage") is composed into the description, under its permit notes; resolved into a key
    // of its own it was never shown (#3808). The template comes last: each entry reads only the ones resolved before it.
    popupDataResolutionStrategy: 'cumulative',
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      notes: {
        field: 'GIS.TS.Lot_Notes.MainteN',
        collapsed: true
      },
      lotType: {
        field: 'GIS.TS.ParkingLots.LotType',
        collapsed: true
      },
      description: `{attributes.notes}\nLot type: {attributes.lotType}`
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
    parkingCategory: 'business',
    keywords: ['maintenance', 'parking']
  }
};
