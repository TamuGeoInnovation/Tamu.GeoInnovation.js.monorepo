import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MOTORCYCLE_PARKING_LAYERS {
  MOTORCYCLE_PARKING_SPACE = 'motorcycle-parking-space'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/MotorcycleParking/MapServer';

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
    title: MotorcycleParkingDefinitions.MOTORCYCLE_PARKING_SPACE.name,
    url: MotorcycleParkingDefinitions.MOTORCYCLE_PARKING_SPACE.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      lotName: { field: 'LotName', collapsed: true },
      spaceType: { field: 'Spc_Type', collapsed: true },
      spaceId: { field: 'Spc_ID_Num', collapsed: true },
      garageLevel: { field: 'Garage_Lvl', collapsed: true },
      rnsNumber: { field: 'RNS_Num', collapsed: true },
      notes: { field: 'Anno_Type', collapsed: true }
    },
    native: {
      outFields: ['*']
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
    keywords: ['motorcycle', 'parking', 'transportation']
  }
};
