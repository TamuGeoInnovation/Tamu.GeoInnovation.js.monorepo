import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  EventConfiguration,
  AggiemapCustomMapConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

export enum RETIREE_PARKING_LAYERS {
  RETIREE_PARKING_LOTS = 'Retiree Parking Lots'
}

const eventUrl = Connections.retireeParkingUrl;

export const RetireeParkingDefinitions = {
  RETIREE_PARKING_LOTS: {
    id: RETIREE_PARKING_LAYERS.RETIREE_PARKING_LOTS,
    layerId: RETIREE_PARKING_LAYERS.RETIREE_PARKING_LOTS,
    name: 'Retiree Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const RetireeParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: RetireeParkingDefinitions.RETIREE_PARKING_LOTS.id,
    title: RetireeParkingDefinitions.RETIREE_PARKING_LOTS.name,
    url: RetireeParkingDefinitions.RETIREE_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.RetireeN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const RetireeParkingConfiguration: EventConfiguration = {
  id: 'retiree-parking',
  name: 'Retiree Parking',
  applicationName: 'Retiree Parking Map',
  shortApplicationName: 'Retiree Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const RetireeParkingOptions: SpecialEventOptions = [];

export const RetireeParkingTs: AggiemapCustomMapConfiguration = {
  configuration: RetireeParkingConfiguration,
  options: RetireeParkingOptions,
  sources: RetireeParkingColdLayerSources,
  references: RETIREE_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: RetireeParkingConfiguration.id,
    name: RetireeParkingConfiguration.name,
    description: 'Parking lot information for Retiree permits.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'permit',
    keywords: ['retiree', 'parking', 'permit']
  }
};
