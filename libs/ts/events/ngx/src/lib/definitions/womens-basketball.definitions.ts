import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum WOMENS_BASKETBALL_LAYERS {
  VISITOR_KIOSK = 'womens-basketball-visitor-kiosk',
  ACCESSIBLE_PARKING = 'womens-basketball-accessible-parking',
  PARKING_LOTS = 'womens-basketball-parking-lots',
  SAFETY_FIRST = 'womens-basketball-safety-first'
}

const eventUrl = Connections.womensBasketballUrl;

export const WomensBasketball_Definitions = {
  VISITOR_KIOSK: {
    id: WOMENS_BASKETBALL_LAYERS.VISITOR_KIOSK,
    layerId: WOMENS_BASKETBALL_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
    layerId: WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/4`
  },
  PARKING: {
    id: WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
    layerId: WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
    name: "Women's Basketball Event Parking Lots",
    url: `${eventUrl}/12`
  },
  SAFETY_FIRST: {
    id: WOMENS_BASKETBALL_LAYERS.SAFETY_FIRST,
    layerId: WOMENS_BASKETBALL_LAYERS.SAFETY_FIRST,
    name: 'Crosswalks',
    url: `${eventUrl}/14`
  }
};

export const WomensBasketball_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: WomensBasketball_Definitions.VISITOR_KIOSK.id,
    title: WomensBasketball_Definitions.VISITOR_KIOSK.name,
    url: WomensBasketball_Definitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: WomensBasketball_Definitions.ACCESSIBLE_PARKING.id,
    title: WomensBasketball_Definitions.ACCESSIBLE_PARKING.name,
    url: WomensBasketball_Definitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: `**Event:** {attributes.Event}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: WomensBasketball_Definitions.PARKING.id,
    title: WomensBasketball_Definitions.PARKING.name,
    url: WomensBasketball_Definitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.WBasketballN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: WomensBasketball_Definitions.SAFETY_FIRST.id,
    title: WomensBasketball_Definitions.SAFETY_FIRST.name,
    url: WomensBasketball_Definitions.SAFETY_FIRST.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Crosswalk',
      description: `**Location:** {attributes.Location}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: "Street_Use = 'X-Walk'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [214, 170, 81, 255],
          width: 2,
          style: 'short-dash'
        }
      }
    }
  }
];

export const WomensBasketball_Configuration: EventConfiguration = {
  id: 'womens-basketball',
  name: "Women's Basketball Map",
  applicationName: "Women's Basketball Parking Map",
  shortApplicationName: "Women's Basketball Parking Map",
  eventDates: [
    '2025-11-05',
    '2025-11-13',
    '2025-12-03',
    '2025-12-14',
    '2025-12-21',
    '2026-01-1',
    '2026-01-11',
    '2026-01-22',
    '2026-02-02',
    '2026-02-08',
    '2026-02-15',
    '2026-02-22',
    '2026-02-26'
  ],
  scheduleUrl: 'https://12thman.com/sports/womens-basketball/schedule',
  zoom: 16,
  mapCenter: [-96.34467, 30.60585]
};

export const WomensBasketball_Options: SpecialEventOptions = [];

export const WomensBasketball_Ts: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: WomensBasketball_Configuration,
  options: WomensBasketball_Options,
  sources: WomensBasketball_ColdLayerSources,
  references: WOMENS_BASKETBALL_LAYERS,
  discover: {
    id: WomensBasketball_Configuration.id,
    name: WomensBasketball_Configuration.name,
    description: "Transportation and parking information for Women's Basketball events.",
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['bike', 'womens-basketball', 'cycling', 'parking', 'transportation']
  }
};
