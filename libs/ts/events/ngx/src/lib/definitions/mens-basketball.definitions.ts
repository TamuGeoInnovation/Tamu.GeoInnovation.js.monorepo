import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MENS_BASKETBALL_LAYERS {
  GATES = 'mens-basketball-gates',
  SYMBOLS = 'mens-basketball-symbols',
  PARKING_LOTS = 'mens-basketball-parking-lots'
}

const eventUrl = Connections.mensBasketballUrl;

export const MensBasketball_Definitions = {
  GATES: {
    id: MENS_BASKETBALL_LAYERS.GATES,
    layerId: MENS_BASKETBALL_LAYERS.GATES,
    name: "Men's Basketball Gates",
    url: `${eventUrl}/0`
  },
  SYMBOLS: {
    id: MENS_BASKETBALL_LAYERS.SYMBOLS,
    layerId: MENS_BASKETBALL_LAYERS.SYMBOLS,
    name: "Men's Basketball Symbols",
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    layerId: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    name: "Men's Basketball Parking",
    url: `${eventUrl}/2`
  }
};

export const MensBasketball_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MensBasketball_Definitions.GATES.id,
    title: MensBasketball_Definitions.GATES.name,
    url: MensBasketball_Definitions.GATES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: MensBasketball_Definitions.SYMBOLS.id,
    title: MensBasketball_Definitions.SYMBOLS.name,
    url: MensBasketball_Definitions.SYMBOLS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: `{attributes.Event}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: MensBasketball_Definitions.PARKING.id,
    title: MensBasketball_Definitions.PARKING.name,
    url: MensBasketball_Definitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.LotType} - {attributes.LotNum}',
      description: `{attributes.Description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const MensBasketball_Configuration: EventConfiguration = {
  id: 'mens-basketball',
  name: "Men's Basketball",
  applicationName: "Men's Basketball Parking",
  shortApplicationName: "Men's Basketball Parking",
  eventDates: [
    '2026-11-03',
    '2026-11-06',
    '2026-11-09',
    '2026-11-12',
    '2026-11-16',
    '2026-12-02',
    '2026-12-06',
    '2026-12-17',
    '2026-12-21',
    '2026-12-29',
    '2027-01-02',
    '2027-01-13',
    '2027-01-16',
    '2027-01-27',
    '2027-02-03',
    '2027-02-13',
    '2027-02-20',
    '2027-02-24',
    '2027-03-06'
  ],
  scheduleUrl: 'https://12thman.com/sports/mens-basketball/schedule',
  zoom: 16,
  mapCenter: [-96.34467, 30.60585]
};

export const MensBasketball_Options: SpecialEventOptions = [];

export const MensBasketball_Ts: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: MensBasketball_Configuration,
  options: MensBasketball_Options,
  sources: MensBasketball_ColdLayerSources,
  references: MENS_BASKETBALL_LAYERS,
  discover: {
    id: MensBasketball_Configuration.id,
    name: MensBasketball_Configuration.name,
    description: "Transportation and parking information for Men's Basketball events.",
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['bike', 'mens-basketball', 'cycling', 'parking', 'transportation']
  }
};
