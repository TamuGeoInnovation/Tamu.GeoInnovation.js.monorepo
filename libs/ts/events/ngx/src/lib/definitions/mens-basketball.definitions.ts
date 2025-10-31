import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MENS_BASKETBALL_LAYERS {
  LINE_PAINT = 'mens-basketball-line-paint',
  GATES = 'mens-basketball-gates',
  SYMBOLS = 'mens-basketball-symbols',
  PARKING_LOTS = 'mens-basketball-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BaseMBasketTennisXCountry/MapServer';

export const MensBasketball_Definitions = {
  LINE_PAINT: {
    id: MENS_BASKETBALL_LAYERS.LINE_PAINT,
    layerId: MENS_BASKETBALL_LAYERS.LINE_PAINT,
    name: "Men's Basketball Line Paint",
    url: `${eventUrl}/6`
  },
  GATES: {
    id: MENS_BASKETBALL_LAYERS.GATES,
    layerId: MENS_BASKETBALL_LAYERS.GATES,
    name: "Men's Basketball Gates",
    url: `${eventUrl}/1`
  },
  SYMBOLS: {
    id: MENS_BASKETBALL_LAYERS.SYMBOLS,
    layerId: MENS_BASKETBALL_LAYERS.SYMBOLS,
    name: "Men's Basketball Symbols",
    url: `${eventUrl}/4`
  },
  PARKING: {
    id: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    layerId: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    name: "Men's Basketball Parking",
    url: `${eventUrl}/9`
  }
};

export const MensBasketball_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MensBasketball_Definitions.LINE_PAINT.id,
    title: MensBasketball_Definitions.LINE_PAINT.name,
    url: MensBasketball_Definitions.LINE_PAINT.url,
    visible: true,
    listMode: 'hide',
    native: {
      outFields: ['*']
    }
  },

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
  name: "Men's Basketball Parking",
  applicationName: "Men's Basketball Parking Map",
  shortApplicationName: "Men's Basketball Parking Map",
  eventDates: ['2025-11-03', '2025-11-06','2025-11-14','2025-11-18','2025-11-21','2025-11-25','2025-12-14','2025-12-21','2025-12-29','2026-01-03','2026-01-10','2026-01-21','2026-01-24','2026-02-07','2026-02-11','2026-02-18','2026-02-28','2026-03-03'],
  zoom: 16,
  mapCenter: [-96.3434, 30.61017]
};

export const MensBasketball_Options: SpecialEventOptions = [];

export const MensBasketball_Ts: ISpecialEventRoot = {
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
    keywords: ['bike', 'mens-basketball', 'cycling', 'parking', 'transportation']
  }
};
