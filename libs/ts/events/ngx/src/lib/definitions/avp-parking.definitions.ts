import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum AVP_PARKING_LAYERS {
  AVP_PARKING_LOTS = 'AVP-parking-lots'
}

const eventUrl = Connections.avpParkingUrl;

export const AVPParkingDefinitions = {
  AVP_PARKING_LOTS: {
    id: AVP_PARKING_LAYERS.AVP_PARKING_LOTS,
    layerId: AVP_PARKING_LAYERS.AVP_PARKING_LOTS,
    name: 'AVP Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const AVPParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AVPParkingDefinitions.AVP_PARKING_LOTS.id,
    title: AVPParkingDefinitions.AVP_PARKING_LOTS.name,
    url: AVPParkingDefinitions.AVP_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.AVPN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const AVPParkingConfiguration: EventConfiguration = {
  id: 'avp-parking',
  name: 'Any Valid Permit (AVP) Parking',
  applicationName: 'Any Valid Permit (AVP) Parking Map',
  shortApplicationName: 'AVP Parking Map',
  introductionText: 'Parking map for AVP permits.',
  eventDates: [],
  mapCenter: [-96.34731, 30.60543],
  zoom: 16
};

export const AVPParkingOptions: SpecialEventOptions = [];

export const AVPParkingTs: AggiemapCustomMapConfiguration = {
  configuration: AVPParkingConfiguration,
  options: AVPParkingOptions,
  sources: AVPParkingColdLayerSources,
  references: AVP_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: AVPParkingConfiguration.id,
    name: AVPParkingConfiguration.name,
    description: 'Parking lot information for AVP permits.',
    source: 'internal',
    type: 'parking',
    keywords: ['avp', 'parking', 'permit']
  }
};
