import { LayerSource } from '@tamu-gisc/common/types';

import { athleticsDevelopmentSource } from './common.definitions';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum BASEBALL_PARKING_LAYERS {
  EVENT_SYMBOLS = 'baseball-event-symbols',
  ACCESSIBLE_SYMBOLS = 'baseball-accessible-symbols',

  ACCESSIBLE_LOTS = 'baseball-accessible-lots',
  ACCESSIBLE_SHUTTLES = 'baseball-accessible-shuttles',

  EVENT_LOTS = 'baseball-event-lots',
  GATE_ROAD_CLOSURE = 'baseball-gate-road-closure'
}

enum BaseballMapMode {
  EVENT = 'event',
  ACCESSIBLE = 'accessible'
}

const eventUrl = Connections.baseballParkingUrl;

export const BaseballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'`
    }
  } as unknown as LayerSource,

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    visible: false,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Baseball'`
    }
  } as unknown as LayerSource,

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
    title: 'Gate/Road Closure',
    url: `${eventUrl}/2`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    native: {
      outFields: ['*'],
      // The layer holds every sport's gates (90 features, 3 of them baseball's) and the view has no
      // filter. Filter here so the map doesn't depend on the published unique-value renderer to hide
      // the other sports' gates — a simple closure renderer would draw all of them.
      definitionExpression: 'baseball = 1'
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
    title: 'Event Parking Lots',
    url: `${eventUrl}/3`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'baseballn',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `baseball IN ('AnyValid','SeasonPass')`
    }
  },

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_LOTS,
    title: 'Accessible Parking Lots',
    url: `${eventUrl}/3`,
    visible: false,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'baseballn',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `baseball = 'Permit'`
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
    title: 'Accessible Shuttle',
    url: `${eventUrl}/1`,
    visible: false,
    popupComponent: EventPopups.MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  }
];

/**
 * Baseball on the development server (#2209). Its view's layers sit at the same indexes as
 * production's, so only the filters and the popup fields change - see `athleticsDevelopmentSource`.
 *
 * Since the republish (#2453) both maps draw the whole lots layer, `Reserved` lots such as 100j
 * included, so `ACCESSIBLE_LOTS` is not declared here: the map-mode option would turn it on over the
 * same lots and draw them twice. The symbols layer has nothing to split on, so each map's symbols
 * layer reads all of it; the option shows one or the other. The shuttle is declared after the lots so
 * it draws over them.
 */
export const BaseballParking_DevelopmentLayerSources: LayerSource[] = [
  athleticsDevelopmentSource({
    id: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
    url: `${eventUrl}/0`
  }),
  athleticsDevelopmentSource({
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
    url: `${eventUrl}/0`
  }),
  athleticsDevelopmentSource({
    id: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
    url: `${eventUrl}/2`
  }),
  athleticsDevelopmentSource({
    id: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
    url: `${eventUrl}/3`
  }),
  athleticsDevelopmentSource({
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
    url: `${eventUrl}/1`
  })
];

export const BaseballParkingConfiguration: EventConfiguration = {
  id: 'baseball-parking',
  name: 'Baseball',
  applicationName: 'Baseball Parking',
  shortApplicationName: 'Baseball Parking',
  introductionText: 'Parking and access information for Texas A&M baseball home games.',
  eventDates: [
    '2027-02-19',
    '2027-02-20',
    '2027-02-21',
    '2027-02-23',
    '2027-02-24',
    '2027-02-26',
    '2027-02-27',
    '2027-02-28',
    '2027-03-02',
    '2027-03-09',
    '2027-03-12',
    '2027-03-13',
    '2027-03-14',
    '2027-03-16',
    '2027-03-23',
    '2027-03-25',
    '2027-03-26',
    '2027-03-27',
    '2027-04-06',
    '2027-04-09',
    '2027-04-10',
    '2027-04-11',
    '2027-04-13',
    '2027-04-20',
    '2027-04-23',
    '2027-04-24',
    '2027-04-25',
    '2027-05-04',
    '2027-05-07',
    '2027-05-08',
    '2027-05-09',
    '2027-05-20',
    '2027-05-21',
    '2027-05-22'
  ],
  toast: {
    id: 'baseball-parking-notification',
    title: 'Baseball Parking Map Available',
    message:
      'Heading to Olsen Field? Click me to open the Baseball Parking Map for parking, shuttle, and road closure information.',
    imgUrl: './assets/images/icons/sports/Baseball.png',
    imgAltText: 'Baseball Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/baseball-parking'
    }
  },
  scheduleUrl: 'https://12thman.com/sports/baseball/schedule',
  mapCenter: [-96.34509, 30.60416],
  zoom: 17
};

export const BaseballParkingOptions: SpecialEventOptions = [
  {
    value: 'map-mode',
    label: 'Choose Your Map',
    shortDescription: 'Map Type',
    description:
      'The Event Map shows event parking lots, symbols, and road closures (no accessibility layers). The Accessibility Map shows accessible parking lots, the accessible shuttle route, and all symbols.',
    choices: [
      { value: BaseballMapMode.EVENT, label: 'Baseball Event Map' },
      { value: BaseballMapMode.ACCESSIBLE, label: 'Accessible Baseball Map' }
    ],
    effects: {
      layers: [
        {
          layerId: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: false } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },

        {
          layerId: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_LOTS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        }
      ]
    }
  }
];

export const BaseballParkingTs: AggiemapCustomMapConfiguration = {
  configuration: BaseballParkingConfiguration,
  options: BaseballParkingOptions,
  sources: BaseballParkingColdLayerSources,
  developmentSources: BaseballParking_DevelopmentLayerSources,
  references: BASEBALL_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: 'baseball-parking',
    name: BaseballParkingConfiguration.name,
    description: 'Baseball event parking with optional accessibility-focused view.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['baseball', 'parking', 'accessible', 'shuttle', 'closure']
  }
};
