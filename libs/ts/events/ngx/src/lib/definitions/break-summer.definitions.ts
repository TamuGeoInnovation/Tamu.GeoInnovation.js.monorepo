import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import esri = __esri;

export enum BREAK_SUMMER_LAYERS {
  BREAK_SUMMER_DRAW = 'break-summer-parking-lots-draw',
  BREAK_SUMMER_LOTS = 'Break-Summer Parking Lots'
}

const eventUrl = Connections.breakSummerParkingUrl;

export const BreakSummerDefinitions = {
  BREAK_SUMMER_LOTS: {
    id: BREAK_SUMMER_LAYERS.BREAK_SUMMER_LOTS,
    layerId: BREAK_SUMMER_LAYERS.BREAK_SUMMER_LOTS,
    name: 'Break-Summer Parking Lots',
    url: `${eventUrl}/0`
  }
};

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;
const breakSummerRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.Lot_Use.Break_Lot',
  field2: 'GIS.TS.Lot_Use.Summer_Lot',
  fieldDelimiter: ',',
  uniqueValueInfos: [
    {
      value: '1,1',
      label: 'Break AND Summer Authorized',
      symbol: {
        type: 'simple-fill',
        color: [190, 232, 255, 0.85],
        outline: null
      } as unknown as esri.SymbolProperties
    },
    {
      value: '1,0',
      label: 'Authorized Break ONLY',
      symbol: {
        type: 'simple-fill',
        color: [90, 0, 0, 0.9],
        outline: null
      } as unknown as esri.SymbolProperties
    },
    {
      value: '0,1',
      label: 'Authorized Summer ONLY',
      symbol: {
        type: 'simple-fill',
        color: [255, 211, 127, 0.9],
        outline: null
      } as unknown as esri.SymbolProperties
    }
  ]
};

export const BreakSummerColdLayerSources: LayerSource[] = [
  {
    type: 'map-image',
    id: BREAK_SUMMER_LAYERS.BREAK_SUMMER_DRAW,
    title: 'Break-Summer Parking Lots',
    url: eventUrl,
    visible: true,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 0,
          title: 'Break-Summer Parking Lots',
          visible: true,
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  },
  {
    type: 'feature',
    id: BreakSummerDefinitions.BREAK_SUMMER_LOTS.id,
    title: BreakSummerDefinitions.BREAK_SUMMER_LOTS.name,
    url: BreakSummerDefinitions.BREAK_SUMMER_LOTS.url,
    visible: true,
    listMode: 'show',

    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.BreakN',
        collapsed: true
      }
    },

    native: {
      outFields: ['*'],
      renderer: breakSummerRenderer
    } as unknown as FeatureNative
  }
];

export const BreakSummerConfiguration: EventConfiguration = {
  id: 'break-summer',
  name: 'Break / Summer',
  applicationName: 'Break / Summer Transportation Map',
  shortApplicationName: 'Break / Summer Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16,
  defaultLayerOverrides: {
    'surface-lots-layer': {
      popupComponent: null
    }
  },
  sidebarInfo: {
    sections: [
      {
        heading: 'Break Parking',
        subheading: '(night permits valid all day)',
        items: [
          'Sept. 1, 2025 – Labor Day',
          'Oct. 13 – 14, 2025 – Fall Break',
          'Nov. 27 – 28, 2025 – Thanksgiving Break',
          'Dec. 19, 2025 – Jan. 11, 2026',
          'Jan. 19, 2026 – MLK',
          'Mar. 9 – 13, 2026 – Spring Break',
          'May 10 – 25, 2026',
          'Aug. 10 – 23, 2026'
        ]
      },
      {
        heading: 'Summer Parking',
        subheading: '(night permits NOT valid during the day)',
        items: ['May 26, 2026 – Aug. 9, 2026']
      }
    ]
  }
};

export const BreakSummerOptions: SpecialEventOptions = [];

export const BreakSummerParkingTs: AggiemapCustomMapConfiguration = {
  configuration: BreakSummerConfiguration,
  options: BreakSummerOptions,
  sources: BreakSummerColdLayerSources,
  type: 'special-event',
  references: BREAK_SUMMER_LAYERS,

  discover: {
    id: BreakSummerConfiguration.id,
    name: BreakSummerConfiguration.name,
    description: 'Parking lot authorization information for Break and Summer.',
    source: 'internal',
    type: 'parking',
    mapType: 'parking',
    keywords: ['break', 'summer', 'parking', 'permit']
  }
};
