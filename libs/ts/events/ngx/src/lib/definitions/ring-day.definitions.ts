import { LayerSource } from '@tamu-gisc/common/types';

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

enum RingDayDates {
  DAY1 = '2026-04-09',
  DAY2 = '2026-04-10'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/Ring_Day/MapServer';

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
  name: 'Ring Day',
  applicationName: 'Ring Day Transportation Map',
  shortApplicationName: 'Ring Day Map',
  introductionText: 'Get the best transportation and logistics information for Ring Day.',
  eventDates: [RingDayDates.DAY1, RingDayDates.DAY2],
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

enum EventDay {
  DAY1 = 'day1',
  DAY2 = 'day2'
}

export const RingDaySpecialEventOptions: SpecialEventOptions = [
  {
    value: RingDayOptions.EVENT_DAY,
    label: 'Event Day',
    description: 'Select which day you plan to attend Ring Day to see the most relevant information for that specific day.',
    shortDescription: 'Event Day',
    choices: [
      {
        value: EventDay.DAY1,
        label: 'November 6, 2025'
      },
      {
        value: EventDay.DAY2,
        label: 'November 7, 2025'
      }
    ],
    effects: {
      layers: [
        {
          layerId: RING_DAY_LAYERS.RD_AREAS,
          conversions: [
            {
              input: EventDay.DAY1,
              expression: `StartDate <= date'${RingDayDates.DAY1}' AND EndDate >= date'${RingDayDates.DAY1}'`
            },
            {
              input: EventDay.DAY2,
              expression: `StartDate <= date'${RingDayDates.DAY2}' AND EndDate >= date'${RingDayDates.DAY2}'`
            }
          ]
        },
        {
          layerId: RING_DAY_LAYERS.RD_ROUTES,
          conversions: [
            {
              input: EventDay.DAY1,
              expression: `Start_Date <= date'${RingDayDates.DAY1}' AND End_Date >= date'${RingDayDates.DAY1}'`
            },
            {
              input: EventDay.DAY2,
              expression: `Start_Date <= date'${RingDayDates.DAY2}' AND End_Date >= date'${RingDayDates.DAY2}'`
            }
          ]
        },
        {
          layerId: RING_DAY_LAYERS.RD_POIS,
          conversions: [
            {
              input: EventDay.DAY1,
              expression: `Start_Date <= date'${RingDayDates.DAY1}' AND End_Date >= date'${RingDayDates.DAY1}'`
            },
            {
              input: EventDay.DAY2,
              expression: `Start_Date <= date'${RingDayDates.DAY2}' AND End_Date >= date'${RingDayDates.DAY2}'`
            }
          ]
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
    description: 'Transportation and logistics information for Ring Day celebrations.',
    source: 'internal',
    type: 'event',
    keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
  }
};
