import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MEDIA_PARKING_LAYERS {
  MEDIA_PARKING_LOTS = 'media-parking-lots'
}
const eventUrl = Connections.mediaParkingUrl;

export const MediaParkingDefinitions = {
  MEDIA_PARKING_LOTS: {
    id: MEDIA_PARKING_LAYERS.MEDIA_PARKING_LOTS,
    layerId: MEDIA_PARKING_LAYERS.MEDIA_PARKING_LOTS,
    name: 'Media Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const MediaParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MediaParkingDefinitions.MEDIA_PARKING_LOTS.id,
    title: MediaParkingDefinitions.MEDIA_PARKING_LOTS.name,
    url: MediaParkingDefinitions.MEDIA_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.AVPN',
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

export const MediaParkingConfiguration: EventConfiguration = {
  id: 'media-parking',
  name: 'Media Parking',
  applicationName: 'Media Parking Map',
  shortApplicationName: 'Media Parking',
  introductionText: 'Parking lot information for media permits.',
  eventDates: [],
  mapCenter: [-96.34731, 30.60543],
  zoom: 16
};

export const MediaParkingOptions: SpecialEventOptions = [];

export const MediaParkingTs: AggiemapCustomMapConfiguration = {
  configuration: MediaParkingConfiguration,
  options: MediaParkingOptions,
  sources: MediaParkingColdLayerSources,
  references: MEDIA_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: MediaParkingConfiguration.id,
    name: MediaParkingConfiguration.name,
    description: 'Parking lot information for media permits.',
    source: 'internal',
    type: 'parking',
    keywords: ['media', 'parking', 'permit']
  }
};
