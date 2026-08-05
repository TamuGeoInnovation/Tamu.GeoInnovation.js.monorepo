import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum TIMED_PARKING_LAYERS {
  TIMED_PARKING_SPACE = 'Timed Parking Space'
}

const eventUrl = Connections.timedParkingUrl;

export const TimedParkingDefinitions = {
  TIMED_PARKING_SPACE: {
    id: TIMED_PARKING_LAYERS.TIMED_PARKING_SPACE,
    layerId: TIMED_PARKING_LAYERS.TIMED_PARKING_SPACE,
    name: 'Timed Parking Space',
    url: `${eventUrl}/0`
  }
};

export const TimedParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TimedParkingDefinitions.TIMED_PARKING_SPACE.id,
    title: TimedParkingDefinitions.TIMED_PARKING_SPACE.name,
    url: TimedParkingDefinitions.TIMED_PARKING_SPACE.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'LotName',
        collapsed: true
      },
      description: {
        field: 'Anno_Type',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const TimedParkingConfiguration: EventConfiguration = {
  id: 'timed-parking',
  name: 'Timed Parking',
  applicationName: 'Timed Parking Map',
  shortApplicationName: 'Timed Parking',
  eventDates: [],
  mapCenter: [-96.34409, 30.6073],
  zoom: 18
};

export const TimedParkingOptions: SpecialEventOptions = [];

export const TimedParking_Ts: AggiemapCustomMapConfiguration = {
  configuration: TimedParkingConfiguration,
  options: TimedParkingOptions,
  sources: TimedParkingColdLayerSources,
  references: TIMED_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: TimedParkingConfiguration.id,
    name: TimedParkingConfiguration.name,
    description: 'Timed parking spaces on campus.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'general',
    showInQuickLinks: true,
    keywords: ['timed', 'parking', 'transportation']
  }
};
