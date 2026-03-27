import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';

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

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/SEC_Grounds_Conference/MapServer';

type FeatureLayerNative = NonNullable<FeatureLayerSourceProperties['native']>;
type AutoCastCimSymbol = { type: 'cim' } & esri.CIMSymbolProperties;

const BUS_ROUTE_COLOR: [number, number, number, number] = [0, 92, 230, 255];
const WALKING_ROUTE_COLOR: [number, number, number, number] = [56, 168, 0, 255];

const BUS_ROUTE_ARROW_SPACING = 52;
const WALKING_ROUTE_ARROW_SPACING = 44;

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
const WALKING_ROUTE_ARROW_SYMBOL = createRepeatedArrowLineSymbol(WALKING_ROUTE_COLOR, 2.25, 6, WALKING_ROUTE_ARROW_SPACING);
const DAY1_ROUTE_PATTERN_SYMBOL = createOutlinedDashedLineSymbol([0, 100, 0, 255], 4.6, 3.2, 1.4, [4, 4]);

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
    native: {
      outFields: ['*']
    }
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
    native: {
      outFields: ['*']
    }
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
