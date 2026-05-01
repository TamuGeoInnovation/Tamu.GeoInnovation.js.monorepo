import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

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

const eventUrl = Connections('gis.it.tamu.edu').baseballParkingUrl;

export const BaseballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.Type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `Event = 'Baseball' AND Type <> 'Accessible Shuttle Stop'`
    }
  },

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    visible: false,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.Type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `Event = 'Baseball'`
    }
  },

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
    title: 'Gate/Road Closure',
    url: `${eventUrl}/2`,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
    title: 'Event Parking Lots',
    url: `${eventUrl}/3`,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.BaseballN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `GIS.TS.SPEV_Lot_Use.Baseball IN ('AnyValid','SeasonPass')`
    }
  },

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_LOTS,
    title: 'Accessible Parking Lots',
    url: `${eventUrl}/3`,
    visible: false,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.BaseballN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `GIS.TS.SPEV_Lot_Use.Baseball = 'Permit'`
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
    title: 'Accessible Shuttle',
    url: `${eventUrl}/1`,
    visible: false,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  }
];

export const BaseballParkingConfiguration: EventConfiguration = {
  id: 'baseball-parking',
  name: 'Baseball',
  applicationName: 'Baseball Parking Map',
  shortApplicationName: 'Baseball Parking',
  introductionText: 'Parking and access information for Texas A&M baseball home games.',
  eventDates: [
    '2026-02-13',
    '2026-02-14',
    '2026-02-15',
    '2026-02-17',
    '2026-02-20',
    '2026-02-21',
    '2026-02-22',
    '2026-02-24',
    '2026-03-03',
    '2026-03-06',
    '2026-03-07',
    '2026-03-08',
    '2026-03-10',
    '2026-03-17',
    '2026-03-20',
    '2026-03-21',
    '2026-03-22',
    '2026-03-24',
    '2026-03-31',
    '2026-04-02',
    '2026-04-03',
    '2026-04-04',
    '2026-04-10',
    '2026-04-11',
    '2026-04-12',
    '2026-04-14',
    '2026-04-21',
    '2026-04-28',
    '2026-05-01',
    '2026-05-02',
    '2026-05-03',
    '2026-05-05',
    '2026-05-14',
    '2026-05-15',
    '2026-05-16'
  ],
  toast: {
    id: 'baseball-parking-notification-2026',
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
  references: BASEBALL_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: 'baseball-parking',
    name: 'Baseball Map',
    description: 'Baseball event parking with optional accessibility-focused view.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['baseball', 'parking', 'accessible', 'shuttle', 'closure']
  }
};
