import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum APRIL_RING_DAY_LAYERS {
  RD_POIS = 'ring-day-pois',
  RD_ROUTES = 'ring-day-routes',
  RD_AREAS = 'ring-day-areas'
}

const APRIL_RING_DAY_PERIODS = [
  { value: 'day1', label: 'Aggie Ring Pickup (April 9, 2026)', dates: ['2026-04-09'] },
  { value: 'day2', label: 'Aggie Ring Day (April 10, 2026)', dates: ['2026-04-10'] }
] as const;

const aprilRingDayDateConversions = (startField: string, endField: string) =>
  APRIL_RING_DAY_PERIODS.map(({ value, dates }) => ({
    input: value,
    expression: `${startField} <= date'${dates[dates.length - 1]}' AND ${endField} >= date'${dates[0]}'`
  }));

const eventUrl = Connections.ringDayUrl;

const AprilRingDayEventDefinitions = {
  RD_AREAS: {
    id: APRIL_RING_DAY_LAYERS.RD_AREAS,
    layerId: APRIL_RING_DAY_LAYERS.RD_AREAS,
    name: 'Ring Day Areas',
    url: `${eventUrl}/1`
  },
  RD_ROUTES: {
    id: APRIL_RING_DAY_LAYERS.RD_ROUTES,
    layerId: APRIL_RING_DAY_LAYERS.RD_ROUTES,
    name: 'Ring Day Routes',
    url: `${eventUrl}/2`
  },
  RD_POIS: {
    id: APRIL_RING_DAY_LAYERS.RD_POIS,
    layerId: APRIL_RING_DAY_LAYERS.RD_POIS,
    name: 'Ring Day Points of Interest',
    url: `${eventUrl}/0`
  }
};

export const AprilRingDayColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AprilRingDayEventDefinitions.RD_AREAS.id,
    title: AprilRingDayEventDefinitions.RD_AREAS.name,
    url: AprilRingDayEventDefinitions.RD_AREAS.url,
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
    id: AprilRingDayEventDefinitions.RD_ROUTES.id,
    title: AprilRingDayEventDefinitions.RD_ROUTES.name,
    url: AprilRingDayEventDefinitions.RD_ROUTES.url,
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
    id: AprilRingDayEventDefinitions.RD_POIS.id,
    title: AprilRingDayEventDefinitions.RD_POIS.name,
    url: AprilRingDayEventDefinitions.RD_POIS.url,
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

export const AprilRingDayConfiguration: EventConfiguration = {
  id: 'april-ring-day',
  name: 'April Ring Day',
  applicationName: 'April Ring Day Transportation Map',
  shortApplicationName: 'April Ring Day Map',
  introductionText: 'Get the best transportation and logistics information for April Ring Day.',
  eventDates: APRIL_RING_DAY_PERIODS.flatMap(({ dates }) => dates),
  scheduleUrl: 'https://www.aggienetwork.com/ring/ringday/',
  mapCenter: [-96.33616, 30.60958],
  zoom: 16,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  },
  toast: {
    id: 'april-ring-day-notification',
    title: 'April Ring Day Transportation Map Available',
    message:
      'Attending April Ring Day? Click me to open the April Ring Day Transportation Map to get the best logistics and transportation information!',
    imgUrl: './assets/images/icons/aggie/Ring Day-Negative.png',
    imgAltText: 'April Ring Day Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/april-ring-day'
    }
  }
};

enum AprilRingDayOptions {
  EVENT_DAY = 'event-day',
  ACCESSIBILITY = 'accessibility'
}

export const AprilRingDaySpecialEventOptions: SpecialEventOptions = [
  {
    value: AprilRingDayOptions.EVENT_DAY,
    label: 'Event Day',
    description:
      'Select which April Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
    shortDescription: 'Event Day',
    choices: APRIL_RING_DAY_PERIODS.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: [
        {
          layerId: APRIL_RING_DAY_LAYERS.RD_AREAS,
          conversions: aprilRingDayDateConversions('StartDate', 'EndDate')
        },
        {
          layerId: APRIL_RING_DAY_LAYERS.RD_ROUTES,
          conversions: aprilRingDayDateConversions('Start_Date', 'End_Date')
        },
        {
          layerId: APRIL_RING_DAY_LAYERS.RD_POIS,
          conversions: aprilRingDayDateConversions('Start_Date', 'End_Date')
        }
      ]
    }
  }
  // {
  //   value: AprilRingDayOptions.ACCESSIBILITY,
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
  //         layerId: APRIL_RING_DAY_LAYERS.RD_AREAS,
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

export const AprilRingDayEvent: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: AprilRingDayConfiguration,
  options: AprilRingDaySpecialEventOptions,
  sources: AprilRingDayColdLayerSources,
  references: APRIL_RING_DAY_LAYERS,
  discover: {
    id: AprilRingDayConfiguration.id,
    name: AprilRingDayConfiguration.name,
    description: 'Transportation and logistics information for April Ring Day celebrations.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    visible: false,
    keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
  }
};
