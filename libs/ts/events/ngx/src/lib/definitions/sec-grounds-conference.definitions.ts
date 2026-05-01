import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum SEC_GROUNDS_LAYERS {
  DAY1_POIS = 'sec-grounds-day1-pois',
  DAY1_ROUTES = 'sec-grounds-day1-routes',
  DAY2_POIS = 'sec-grounds-day2-pois',
  DAY2_ROUTES = 'sec-grounds-day2-routes',
  DAY3_POIS = 'sec-grounds-day3-pois',
  DAY3_ROUTES = 'sec-grounds-day3-routes'
}

enum ConferenceDay {
  DAY1 = 'day1',
  DAY2 = 'day2',
  DAY3 = 'day3'
}

const eventUrl = Connections.secGroundsConferenceUrl;

type FeatureLayerNative = NonNullable<FeatureLayerSourceProperties['native']>;
type AutoCastCimSymbol = { type: 'cim' } & esri.CIMSymbolProperties;
type AutoCastSymbol = esri.SymbolProperties;

const BUS_ROUTE_COLOR: [number, number, number, number] = [0, 92, 230, 255];
const BUS_ROUTE_ARROW_SPACING = 52;

const createRepeatedArrowLineSymbol = (
  color: [number, number, number, number],
  strokeWidth: number,
  arrowSize: number,
  placement: number
): AutoCastCimSymbol => ({
  type: 'cim',
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMLineSymbol',
      symbolLayers: [
        {
          type: 'CIMSolidStroke',
          enable: true,
          width: strokeWidth,
          color
        },
        {
          type: 'CIMVectorMarker',
          enable: true,
          size: arrowSize,
          markerPlacement: {
            type: 'CIMMarkerPlacementAlongLineSameSize',
            endings: 'WithMarkers',
            placementTemplate: [placement],
            angleToLine: true
          },
          frame: {
            xmin: -5,
            ymin: -5,
            xmax: 5,
            ymax: 5
          },
          markerGraphics: [
            {
              type: 'CIMMarkerGraphic',
              primitiveName: 'route-arrow',
              textString: '',
              geometry: {
                rings: [
                  [
                    [-8, -5.47],
                    [-8, 5.6],
                    [1.96, -0.03],
                    [-8, -5.47]
                  ]
                ]
              },
              symbol: {
                type: 'CIMPolygonSymbol',
                symbolLayers: [
                  {
                    type: 'CIMSolidFill',
                    enable: true,
                    color
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
});

const createOutlinedDashedLineSymbol = (
  color: [number, number, number, number],
  casingWidth: number,
  fillWidth: number,
  dashWidth: number,
  dashTemplate: number[]
): AutoCastCimSymbol => ({
  type: 'cim',
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMLineSymbol',
      symbolLayers: [
        {
          type: 'CIMSolidStroke',
          enable: true,
          capStyle: 'Butt',
          joinStyle: 'Miter',
          effects: [
            {
              type: 'CIMGeometricEffectDashes',
              dashTemplate,
              offsetAlongLine: 0,
              lineDashEnding: 'FullGap'
            }
          ],
          width: dashWidth,
          color
        },
        {
          type: 'CIMSolidStroke',
          enable: true,
          capStyle: 'Butt',
          joinStyle: 'Miter',
          width: fillWidth,
          color: [255, 255, 255, 255]
        },
        {
          type: 'CIMSolidStroke',
          enable: true,
          capStyle: 'Butt',
          joinStyle: 'Miter',
          width: casingWidth,
          color
        }
      ]
    }
  }
});

const BUS_ROUTE_ARROW_SYMBOL = createRepeatedArrowLineSymbol(BUS_ROUTE_COLOR, 3.5, 7, BUS_ROUTE_ARROW_SPACING);
const DAY1_ROUTE_PATTERN_SYMBOL = createOutlinedDashedLineSymbol([0, 100, 0, 255], 4.6, 3.2, 1.4, [4, 4]);

// Legend swatches for route layers. ArcGIS CIM symbol swatches are generated at a fixed
// size that can look misleading in the legend, so we provide hand-crafted SVGs that more
// clearly represent the actual appearance of each route type.
const toSvgDataUri = (svg: string): string => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const BUS_ROUTE_LEGEND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16" viewBox="0 0 48 16" fill="none"><path d="M2 8H46" stroke="#005CE6" stroke-width="3.5" stroke-linecap="round"/><path d="M11 4.5V11.5L17 8L11 4.5Z" fill="#005CE6"/><path d="M22 4.5V11.5L28 8L22 4.5Z" fill="#005CE6"/><path d="M33 4.5V11.5L39 8L33 4.5Z" fill="#005CE6"/></svg>';

const WALKING_ROUTE_LEGEND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16" viewBox="0 0 48 16" fill="none"><path d="M2 8H46" stroke="#38A800" stroke-width="4.6" stroke-linecap="square"/><path d="M2 8H46" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="square"/><path d="M2 8H46" stroke="#38A800" stroke-width="1.4" stroke-linecap="square" stroke-dasharray="4 4"/></svg>';
const CHECKPOINT_SYMBOL_IMAGE_DATA =
  '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';
const CHECKPOINT_SYMBOL_WIDTH = 25;
const CHECKPOINT_SYMBOL_HEIGHT = (CHECKPOINT_SYMBOL_WIDTH * 34) / 27;

const createConferenceStartSymbol = (): AutoCastSymbol => ({
  type: 'simple-marker',
  style: 'circle',
  color: [0, 168, 132, 255],
  size: 10,
  outline: {
    color: [0, 115, 76, 255],
    width: 1
  }
} as unknown as AutoCastSymbol);

const createConferenceEndSymbol = (): AutoCastSymbol => ({
  type: 'simple-marker',
  style: 'square',
  color: [78, 78, 78, 255],
  size: 10,
  outline: {
    color: [255, 255, 255, 255],
    width: 1
  }
} as unknown as AutoCastSymbol);

const createCheckpointSymbol = (): AutoCastSymbol => ({
  type: 'picture-marker',
  url: `data:image/png;base64,${CHECKPOINT_SYMBOL_IMAGE_DATA}`,
  // Preserve the published 27x34 pin aspect ratio instead of forcing the art into a square.
  width: CHECKPOINT_SYMBOL_WIDTH,
  height: CHECKPOINT_SYMBOL_HEIGHT
} as unknown as AutoCastSymbol);

const createRouteLayerNative = (
  values: Array<{ value: string; label: string; symbol: AutoCastCimSymbol }>
): FeatureLayerNative => ({
  outFields: ['*'],
  renderer: {
    type: 'unique-value',
    field: 'description',
    uniqueValueInfos: values.map((valueInfo) => ({
      ...valueInfo
    }))
  }
});

const DAY1_ROUTE_NATIVE = createRouteLayerNative([
  {
    value: 'Walking Tour Day 1',
    label: 'Walking Tour Day 1',
    symbol: DAY1_ROUTE_PATTERN_SYMBOL
  }
]);

const DAY2_ROUTE_NATIVE = createRouteLayerNative([
  {
    value: 'Bus Tour Route Day 2',
    label: 'Bus Tour Route Day 2',
    symbol: BUS_ROUTE_ARROW_SYMBOL
  },
  {
    value: 'Walking Tour Day 2',
    label: 'Walking Tour Day 2',
    symbol: DAY1_ROUTE_PATTERN_SYMBOL
  }
]);

const DAY3_ROUTE_NATIVE = createRouteLayerNative([
  {
    value: 'Bus Tour Route Day 3',
    label: 'Bus Tour Route Day 3',
    symbol: BUS_ROUTE_ARROW_SYMBOL
  },
  {
    value: 'Walking Tour Day 3',
    label: 'Walking Tour Day 3',
    symbol: DAY1_ROUTE_PATTERN_SYMBOL
  }
]);

const createConferencePoiLayerNative = (dayNumber: 2 | 3): FeatureLayerNative => ({
  outFields: ['*'],
  renderer: {
    type: 'unique-value',
    field: 'description',
    uniqueValueInfos: [
      {
        value: `Day ${dayNumber} Start`,
        label: `Day ${dayNumber} Start`,
        symbol: createConferenceStartSymbol()
      },
      {
        value: `Day ${dayNumber} End`,
        label: `Day ${dayNumber} End`,
        symbol: createConferenceEndSymbol()
      },
      {
        value: `Day ${dayNumber} Checkpoint`,
        label: `Day ${dayNumber} Checkpoint`,
        symbol: createCheckpointSymbol()
      }
    ]
  }
});

const VISIBLE_DAY_LAYER_OVERRIDES = {
  visible: true,
  listMode: 'show'
} as const;

const HIDDEN_DAY_LAYER_OVERRIDES = {
  visible: false,
  listMode: 'hide'
} as const;

const CONFERENCE_DAYS = [ConferenceDay.DAY1, ConferenceDay.DAY2, ConferenceDay.DAY3] as const;

const createConferenceDayLayerConversions = (activeDay: ConferenceDay) =>
  CONFERENCE_DAYS.map((day) => ({
    input: day,
    expression: day === activeDay ? '1=1' : '1=0',
    propOverrides: day === activeDay ? VISIBLE_DAY_LAYER_OVERRIDES : HIDDEN_DAY_LAYER_OVERRIDES
  }));

export const SecGroundsColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY1_ROUTES,
    title: 'Day 1 Routes',
    url: eventUrl + '/2',
    visible: true,
    listMode: 'show',
    native: DAY1_ROUTE_NATIVE
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY1_POIS,
    title: 'Day 1 Points of Interest',
    url: eventUrl + '/1',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY2_ROUTES,
    title: 'Day 2 Routes',
    url: eventUrl + '/5',
    visible: true,
    listMode: 'show',
    native: DAY2_ROUTE_NATIVE
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY2_POIS,
    title: 'Day 2 Points of Interest',
    url: eventUrl + '/4',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: createConferencePoiLayerNative(2)
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY3_ROUTES,
    title: 'Day 3 Routes',
    url: eventUrl + '/8',
    visible: true,
    listMode: 'show',
    native: DAY3_ROUTE_NATIVE
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY3_POIS,
    title: 'Day 3 Points of Interest',
    url: eventUrl + '/7',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: createConferencePoiLayerNative(3)
  }
];

export const SecGroundsConfiguration: EventConfiguration = {
  id: 'sec-grounds-conference',
  name: 'SEC Grounds Conference',
  applicationName: 'SEC Grounds Conference Map',
  shortApplicationName: 'SEC Grounds Map',
  introductionText: 'Get routes and points of interest for the SEC Grounds Conference.',
  eventDates: ['2026-04-07', '2026-04-08', '2026-04-09'],
  mapCenter: [-96.3438, 30.6186],
  zoom: 14,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  }
};

export const SecGroundsSpecialEventOptions: SpecialEventOptions = [
  {
    value: 'conference-day',
    label: 'Conference Day',
    description: 'Select which day of the SEC Grounds Conference you are attending to see the relevant routes and points of interest.',
    shortDescription: 'Conference Day',
    choices: [
      {
        value: ConferenceDay.DAY1,
        label: 'Day 1 (April 7, 2026)'
      },
      {
        value: ConferenceDay.DAY2,
        label: 'Day 2 (April 8, 2026)'
      },
      {
        value: ConferenceDay.DAY3,
        label: 'Day 3 (April 9, 2026)'
      }
    ],
    effects: {
      layers: [
        {
          layerId: SEC_GROUNDS_LAYERS.DAY1_POIS,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY1)
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY1_ROUTES,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY1)
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY2_POIS,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY2)
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY2_ROUTES,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY2)
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY3_POIS,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY3)
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY3_ROUTES,
          conversions: createConferenceDayLayerConversions(ConferenceDay.DAY3)
        }
      ]
    }
  }
];


// Legend swatch overrides for SEC Grounds Conference route layers.

export const SecGroundsLegendSrcOverrides: Record<string, string> = {
  'Bus Tour Route Day ': toSvgDataUri(BUS_ROUTE_LEGEND_SVG),
  'Walking Tour Day ': toSvgDataUri(WALKING_ROUTE_LEGEND_SVG)
};

export const SecGroundsConferenceTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: SecGroundsConfiguration,
  options: SecGroundsSpecialEventOptions,
  sources: SecGroundsColdLayerSources,
  references: SEC_GROUNDS_LAYERS,
  discover: {
    id: SecGroundsConfiguration.id,
    name: SecGroundsConfiguration.name,
    description: 'Routes and points of interest for the SEC Grounds Conference.',
    source: 'internal',
    type: 'event',
    keywords: ['sec', 'grounds', 'conference', 'routes', 'transportation']
  }
};
