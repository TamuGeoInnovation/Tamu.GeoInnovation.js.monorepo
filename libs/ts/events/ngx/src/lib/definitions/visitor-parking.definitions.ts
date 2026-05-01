import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum VISITOR_PARKING_LAYERS {
  VISITOR_KIOSKS = 'Visitor Kiosks',
  VISITOR_PARKING_LOTS = 'Visitor Parking Lots'
}

const eventUrl = Connections.visitorParkingUrl;

export const VisitorParkingDefinitions = {
  VISITOR_KIOSKS: {
    id: VISITOR_PARKING_LAYERS.VISITOR_KIOSKS,
    layerId: VISITOR_PARKING_LAYERS.VISITOR_KIOSKS,
    name: 'Visitor Kiosks',
    url: `${eventUrl}/0`
  },
  VISITOR_PARKING_LOTS: {
    id: VISITOR_PARKING_LAYERS.VISITOR_PARKING_LOTS,
    layerId: VISITOR_PARKING_LAYERS.VISITOR_PARKING_LOTS,
    name: 'Visitor Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const VisitorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VisitorParkingDefinitions.VISITOR_KIOSKS.id,
    title: VisitorParkingDefinitions.VISITOR_KIOSKS.name,
    url: VisitorParkingDefinitions.VISITOR_KIOSKS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: true,
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: VisitorParkingDefinitions.VISITOR_PARKING_LOTS.id,
    title: VisitorParkingDefinitions.VISITOR_PARKING_LOTS.name,
    url: VisitorParkingDefinitions.VISITOR_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.VisitorN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'GIS.TS.Lot_Use.Visitor_Lot',
        uniqueValueInfos: [
          {
            value: '1',
            label: 'Hourly Visitor Parking',
            symbol: {
              type: 'simple-fill',
              color: 'rgb(0, 77, 168)'
            } as unknown as esri.SimpleFillSymbolProperties
          }
        ]
      }
    },
  }
];

export const VisitorParkingConfiguration: EventConfiguration = {
  id: 'visitor-parking',
  name: 'Visitor Parking',
  applicationName: 'Visitor Parking Map',
  shortApplicationName: 'Visitor Parking Map',
  introductionText: 'Parking Map for Visitors',
  eventDates: [],
  mapCenter: [-96.33771, 30.62143],
  zoom: 17
};

export const VisitorParkingOptions: SpecialEventOptions = [];

export const VisitorParkingTs: AggiemapCustomMapConfiguration = {
  configuration: VisitorParkingConfiguration,
  options: VisitorParkingOptions,
  sources: VisitorParkingColdLayerSources,
  references: VISITOR_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: VisitorParkingConfiguration.id,
    name: VisitorParkingConfiguration.name,
    description: 'Parking information for visitors.',
    source: 'internal',
    type: 'parking',
    keywords: ['visitor', 'parking', 'kiosk', 'hourly']
  }
};
