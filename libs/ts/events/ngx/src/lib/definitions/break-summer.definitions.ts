import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import esri = __esri;

export enum BREAK_SUMMER_LAYERS {
  BREAK_SUMMER_DRAW = 'break-summer-parking-lots-draw',
  BREAK_SUMMER_LEGEND = 'break-summer-parking-lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

// Renderer typing helpers
type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

// Renderer for legend/click FeatureLayer
const breakSummerLegendRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.Lot_Use.Break_Lot',
  field2: 'GIS.TS.Lot_Use.Summer_Lot',
  fieldDelimiter: ',',
  defaultLabel: 'Lot Specific Permit Required',
  defaultSymbol: {
    type: 'simple-fill',
    color: [204, 204, 204, 255],
    outline: null
  } as unknown as esri.SymbolProperties,
  uniqueValueInfos: [
    {
      value: '1,1',
      label: 'Break AND Summer Authorized',
      symbol: { type: 'simple-fill', color: [190, 232, 255, 255], outline: null } as unknown as esri.SymbolProperties
    },
    {
      value: '1,0',
      label: 'Authorized Break ONLY',
      symbol: { type: 'simple-fill', color: [90, 0, 0, 255], outline: null } as unknown as esri.SymbolProperties
    },
    {
      value: '0,1',
      label: 'Authorized Summer ONLY',
      symbol: { type: 'simple-fill', color: [255, 211, 127, 255], outline: null } as unknown as esri.SymbolProperties
    }
  ]
};

export const BreakSummerColdLayerSources: LayerSource[] = [
  // 1) DRAW LAYER (MapImage) – draws polygons
  {
    type: 'map-image',
    id: BREAK_SUMMER_LAYERS.BREAK_SUMMER_DRAW,
    title: 'Break-Summer Parking Lots (Draw)',
    url: eventUrl,
    visible: true,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 5,
          title: 'Break-Summer Parking Lots',
          visible: true,

          // IMPORTANT: don’t let the map-image layer handle popups
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  },

  // 2) CLICK + LEGEND LAYER (Feature) – invisible but clickable & drives legend
  {
    type: 'feature',
    id: BREAK_SUMMER_LAYERS.BREAK_SUMMER_LEGEND,
    title: 'Break-Summer Parking Lots',
    url: `${eventUrl}/5`,
    visible: true,
    listMode: 'show',

    native: {
      outFields: ['*'],
      renderer: breakSummerLegendRenderer
    } as unknown as FeatureNative,

    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      breakNote: {
        field: 'GIS.TS.Lot_Notes.BreakN',
        collapsed: true
      },
      summerNote: {
        field: 'GIS.TS.Lot_Notes.SummerN',
        collapsed: true
      },
      description:
        `**Break:** {attributes.breakNote}\n\n` +
        `**Summer:** {attributes.summerNote}`
    }
  }
];

export const BreakSummerConfiguration: EventConfiguration = {
  id: 'break-summer',
  name: 'Break / Summer',
  applicationName: 'Break / Summer Transportation Map',
  shortApplicationName: 'Break / Summer Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const BreakSummerOptions: SpecialEventOptions = [];

export const BreakSummerParkingTs: ISpecialEventRoot = {
  configuration: BreakSummerConfiguration,
  options: BreakSummerOptions,
  sources: BreakSummerColdLayerSources,
  references: BREAK_SUMMER_LAYERS,
  discover: {
    id: BreakSummerConfiguration.id,
    name: BreakSummerConfiguration.name,
    description: 'Parking lot authorization information for Break and Summer.',
    source: 'internal',
    type: 'event',
    keywords: ['break', 'summer', 'parking', 'permit']
  }
};
