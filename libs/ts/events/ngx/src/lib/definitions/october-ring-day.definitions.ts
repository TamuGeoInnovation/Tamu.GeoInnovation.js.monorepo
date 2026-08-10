import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum RING_DAY_LAYERS {
  RD_POIS = 'ring-day-pois',
  RD_ROUTES = 'ring-day-routes',
  RD_AREAS = 'ring-day-areas'
}

const RING_DAY_PERIODS = [
  { value: 'day1', label: 'Aggie Ring Pickup (October 8, 2026)', dates: ['2026-10-08'] },
  { value: 'day2', label: 'Aggie Ring Day (October 9-10, 2026)', dates: ['2026-10-09', '2026-10-10'] }
] as const;

const ringDayDateConversions = (startField: string, endField: string) =>
  RING_DAY_PERIODS.map(({ value, dates }) => ({
    input: value,
    expression: `${startField} <= date'${dates[dates.length - 1]}' AND ${endField} >= date'${dates[0]}'`
  }));

const eventUrl = Connections.ringDayUrl;

const RingDayEventDefinitions = {
  RD_AREAS: {
    id: RING_DAY_LAYERS.RD_AREAS,
    layerId: RING_DAY_LAYERS.RD_AREAS,
    name: 'Ring Day Areas',
    url: `${eventUrl}/1`
  },
  RD_ROUTES: {
    id: RING_DAY_LAYERS.RD_ROUTES,
    layerId: RING_DAY_LAYERS.RD_ROUTES,
    name: 'Ring Day Routes',
    url: `${eventUrl}/2`
  },
  RD_POIS: {
    id: RING_DAY_LAYERS.RD_POIS,
    layerId: RING_DAY_LAYERS.RD_POIS,
    name: 'Ring Day Points of Interest',
    url: `${eventUrl}/0`
  }
};

export const RingDayColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_AREAS.id,
    title: RingDayEventDefinitions.RD_AREAS.name,
    url: RingDayEventDefinitions.RD_AREAS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.Notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_ROUTES.id,
    title: RingDayEventDefinitions.RD_ROUTES.name,
    url: RingDayEventDefinitions.RD_ROUTES.url,
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
    id: RingDayEventDefinitions.RD_POIS.id,
    title: RingDayEventDefinitions.RD_POIS.name,
    url: RingDayEventDefinitions.RD_POIS.url,
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

export const RingDayConfiguration: EventConfiguration = {
  id: 'ring-day',
  name: 'October Ring Day',
  applicationName: 'October Ring Day Transportation Map',
  shortApplicationName: 'October Ring Day Map',
  introductionText: 'Get the best transportation and logistics information for October Ring Day.',
  eventDates: RING_DAY_PERIODS.flatMap(({ dates }) => dates),
  scheduleUrl: 'https://www.aggienetwork.com/ring/ringday/',
  mapCenter: [-96.33616, 30.60958],
  zoom: 16,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  },
  toast: {
    id: 'ring-day-notification',
    title: 'Ring Day Transportation Map Available',
    message:
      'Attending Ring Day? Click me to open the Ring Day Transportation Map to get the best logistics and transportation information!',
    imgUrl: './assets/images/icons/aggie/Ring Day-Negative.png',
    imgAltText: 'Ring Day Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/ring-day'
    }
  }
};

enum RingDayOptions {
  EVENT_DAY = 'event-day',
  ACCESSIBILITY = 'accessibility'
}

export const RingDaySpecialEventOptions: SpecialEventOptions = [
  {
    value: RingDayOptions.EVENT_DAY,
    label: 'Event Day',
    description:
      'Select which Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
    shortDescription: 'Event Day',
    choices: RING_DAY_PERIODS.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: [
        {
          layerId: RING_DAY_LAYERS.RD_AREAS,
          conversions: ringDayDateConversions('StartDate', 'EndDate')
        },
        {
          layerId: RING_DAY_LAYERS.RD_ROUTES,
          conversions: ringDayDateConversions('Start_Date', 'End_Date')
        },
        {
          layerId: RING_DAY_LAYERS.RD_POIS,
          conversions: ringDayDateConversions('Start_Date', 'End_Date')
        }
      ]
    }
  }
  // {
  //   value: RingDayOptions.ACCESSIBILITY,
  //   label: 'Accessible Accommodations',
  //   description: 'Will you require accessibility accommodations to view relevant accessible routes and options?',
  //   shortDescription: 'Accessible Accommodations',
  //   choices: [
  //     {
  //       value: AccessibilityOptions.ACCESSIBLE,
  //       label: 1
  //     },
  //     {
  //       value: AccessibilityOptions.STANDARD,
  //       label: 'No'
  //     }
  //   ],
  //   effects: {
  //     layers: [
  //       {
  //         layerId: RING_DAY_LAYERS.RD_AREAS,
  //         conversions: [
  //           {
  //             input: AccessibilityOptions.STANDARD,
  //             expression: "Type NOT LIKE '%ADA%'"
  //           },
  //           {
  //             input: AccessibilityOptions.ACCESSIBLE,
  //             expression: "Type LIKE '%ADA%'"
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // }
];

export const RingDayEvent: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: RingDayConfiguration,
  options: RingDaySpecialEventOptions,
  sources: RingDayColdLayerSources,
  references: RING_DAY_LAYERS,
  discover: {
    id: RingDayConfiguration.id,
    name: RingDayConfiguration.name,
    description: 'Transportation and logistics information for October Ring Day celebrations.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
  }
};
