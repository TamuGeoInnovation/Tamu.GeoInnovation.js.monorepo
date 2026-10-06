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

const CONFERENCE_DAYS = [
  {
    value: 'day1',
    date: '2026-04-07',
    label: 'Day 1 (April 7, 2026)',
    layerIds: [SEC_GROUNDS_LAYERS.DAY1_POIS, SEC_GROUNDS_LAYERS.DAY1_ROUTES]
  },
  {
    value: 'day2',
    date: '2026-04-08',
    label: 'Day 2 (April 8, 2026)',
    layerIds: [SEC_GROUNDS_LAYERS.DAY2_POIS, SEC_GROUNDS_LAYERS.DAY2_ROUTES]
  },
  {
    value: 'day3',
    date: '2026-04-09',
    label: 'Day 3 (April 9, 2026)',
    layerIds: [SEC_GROUNDS_LAYERS.DAY3_POIS, SEC_GROUNDS_LAYERS.DAY3_ROUTES]
  }
] as const;

type ConferenceDay = (typeof CONFERENCE_DAYS)[number]['value'];

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
const createRouteLayerNative = (
  values: Array<{ value: string; label: string; symbol: AutoCastCimSymbol }>
): FeatureLayerNative => ({
  outFields: ['*']
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
  outFields: ['*']
});

const VISIBLE_DAY_LAYER_OVERRIDES = {
  visible: true,
  listMode: 'show'
} as const;

const HIDDEN_DAY_LAYER_OVERRIDES = {
  visible: false,
  listMode: 'hide'
} as const;

const createConferenceDayLayerConversions = (activeDay: ConferenceDay) =>
  CONFERENCE_DAYS.map(({ value }) => ({
    input: value,
    expression: value === activeDay ? '1=1' : '1=0',
    propOverrides: value === activeDay ? VISIBLE_DAY_LAYER_OVERRIDES : HIDDEN_DAY_LAYER_OVERRIDES
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
  eventDates: CONFERENCE_DAYS.map(({ date }) => date),
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
    choices: CONFERENCE_DAYS.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: CONFERENCE_DAYS.flatMap(({ value, layerIds }) =>
        layerIds.map((layerId) => ({
          layerId,
          conversions: createConferenceDayLayerConversions(value)
        }))
      )
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
    columnKey: 'spring',
    keywords: ['sec', 'grounds', 'conference', 'routes', 'transportation']
  }
};
