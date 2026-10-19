import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum MOTORCYCLE_PARKING_LAYERS {
  MOTORCYCLE_PARKING_SPACE = 'motorcycle-parking-space'
}

const eventUrl = Connections.motorcycleParkingUrl;

export const MotorcycleParkingDefinitions = {
  MOTORCYCLE_PARKING_SPACE: {
    id: MOTORCYCLE_PARKING_LAYERS.MOTORCYCLE_PARKING_SPACE,
    layerId: MOTORCYCLE_PARKING_LAYERS.MOTORCYCLE_PARKING_SPACE,
    name: 'Motorcycle Parking Space',
    url: `${eventUrl}/0`
  }
};

export const MotorcycleParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MotorcycleParkingDefinitions.MOTORCYCLE_PARKING_SPACE.id,
    url: MotorcycleParkingDefinitions.MOTORCYCLE_PARKING_SPACE.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      lotName: { field: 'LotName', collapsed: true },
      spaceType: { field: 'Spc_Type', collapsed: true },
      spaceId: { field: 'Spc_ID_Num', collapsed: true },
      garageLevel: { field: 'Garage_Lvl', collapsed: true },
      rnsNumber: { field: 'RNS_Num', collapsed: true },
      notes: { field: 'Anno_Type', collapsed: true }
    },
    native: {
      outFields: ['*'],
      // The service holds every parking space on campus, about 45,000, and its symbology draws only
      // motorcycle spaces; the rest were loaded and never drawn, which left the map drawing for minutes
      // on ArcGIS 5.1 (#1897). Same spaces drawn, and only those loaded. Remove it if the service is
      // republished with motorcycle spaces only. `parking-spaces.spec.ts` in the smoke suite fails if
      // the symbology starts drawing a type this leaves out.
      definitionExpression: `Spc_Type = 'M/C'`
    }
  }
];

export const MotorcycleParkingConfiguration: EventConfiguration = {
  id: 'motorcycle-parking',
  name: 'Motorcycle Parking',
  applicationName: 'Motorcycle Parking Map',
  shortApplicationName: 'Motorcycle Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const MotorcycleParkingOptions: SpecialEventOptions = [];

export const MotorcycleParkingTs: AggiemapCustomMapConfiguration = {
  configuration: MotorcycleParkingConfiguration,
  options: MotorcycleParkingOptions,
  sources: MotorcycleParkingColdLayerSources,
  references: MOTORCYCLE_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: MotorcycleParkingConfiguration.id,
    name: MotorcycleParkingConfiguration.name,
    description: 'Motorcycle parking space locations on campus.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'permit',
    keywords: ['motorcycle', 'parking', 'transportation']
  }
};
