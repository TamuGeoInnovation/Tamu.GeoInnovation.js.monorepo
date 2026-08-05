import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum NOVEMBER_RING_DAY_LAYERS {
  RD_POIS = 'ring-day-pois',
  RD_ROUTES = 'ring-day-routes',
  RD_AREAS = 'ring-day-areas'
}

enum NovemberRingDayDates {
  DAY2 = '2026-11-06'
}

const eventUrl = Connections.ringDayUrl;

const NovemberRingDayEventDefinitions = {
  RD_AREAS: {
    id: NOVEMBER_RING_DAY_LAYERS.RD_AREAS,
    layerId: NOVEMBER_RING_DAY_LAYERS.RD_AREAS,
    name: 'Ring Day Areas',
    url: `${eventUrl}/1`
  },
  RD_ROUTES: {
    id: NOVEMBER_RING_DAY_LAYERS.RD_ROUTES,
    layerId: NOVEMBER_RING_DAY_LAYERS.RD_ROUTES,
    name: 'Ring Day Routes',
    url: `${eventUrl}/2`
  },
  RD_POIS: {
    id: NOVEMBER_RING_DAY_LAYERS.RD_POIS,
    layerId: NOVEMBER_RING_DAY_LAYERS.RD_POIS,
    name: 'Ring Day Points of Interest',
    url: `${eventUrl}/0`
  }
};

export const NovemberRingDayColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: NovemberRingDayEventDefinitions.RD_AREAS.id,
    title: NovemberRingDayEventDefinitions.RD_AREAS.name,
    url: NovemberRingDayEventDefinitions.RD_AREAS.url,
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
    id: NovemberRingDayEventDefinitions.RD_ROUTES.id,
    title: NovemberRingDayEventDefinitions.RD_ROUTES.name,
    url: NovemberRingDayEventDefinitions.RD_ROUTES.url,
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
    id: NovemberRingDayEventDefinitions.RD_POIS.id,
    title: NovemberRingDayEventDefinitions.RD_POIS.name,
    url: NovemberRingDayEventDefinitions.RD_POIS.url,
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

export const NovemberRingDayConfiguration: EventConfiguration = {
  id: 'november-ring-day',
  name: 'November Ring Day',
  applicationName: 'November Ring Day Transportation Map',
  shortApplicationName: 'November Ring Day Map',
  introductionText: 'Get the best transportation and logistics information for November Ring Day.',
  eventDates: [NovemberRingDayDates.DAY2],
  scheduleUrl: 'https://www.aggienetwork.com/ring/ringday/',
  mapCenter: [-96.33616, 30.60958],
  zoom: 16,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  },
  toast: {
    id: 'november-ring-day-notification',
    title: 'November Ring Day Transportation Map Available',
    message:
      'Attending November Ring Day? Click me to open the November Ring Day Transportation Map to get the best logistics and transportation information!',
    imgUrl: './assets/images/icons/aggie/Ring Day-Negative.png',
    imgAltText: 'November Ring Day Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/november-ring-day'
    }
  }
};

enum NovemberRingDayOptions {
  EVENT_DAY = 'event-day'
}

enum EventDay {
  DAY2 = 'day2'
}

export const NovemberRingDaySpecialEventOptions: SpecialEventOptions = [
  {
    value: NovemberRingDayOptions.EVENT_DAY,
    label: 'Event Day',
    description:
      'Select the November Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
    shortDescription: 'Event Day',
    choices: [
      {
        value: EventDay.DAY2,
        label: 'Aggie Ring Day (November 6, 2026)'
      }
    ],
    effects: {
      layers: [
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_AREAS,
          conversions: [
            {
              input: EventDay.DAY2,
              expression: `StartDate <= date'${NovemberRingDayDates.DAY2}' AND EndDate >= date'${NovemberRingDayDates.DAY2}'`
            }
          ]
        },
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_ROUTES,
          conversions: [
            {
              input: EventDay.DAY2,
              expression: `Start_Date <= date'${NovemberRingDayDates.DAY2}' AND End_Date >= date'${NovemberRingDayDates.DAY2}'`
            }
          ]
        },
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_POIS,
          conversions: [
            {
              input: EventDay.DAY2,
              expression: `Start_Date <= date'${NovemberRingDayDates.DAY2}' AND End_Date >= date'${NovemberRingDayDates.DAY2}'`
            }
          ]
        }
      ]
    }
  }
];

export const NovemberRingDayEvent: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: NovemberRingDayConfiguration,
  options: NovemberRingDaySpecialEventOptions,
  sources: NovemberRingDayColdLayerSources,
  references: NOVEMBER_RING_DAY_LAYERS,
  discover: {
    id: NovemberRingDayConfiguration.id,
    name: NovemberRingDayConfiguration.name,
    description: 'Transportation and logistics information for November Ring Day celebrations.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    visible: false,
    keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
  }
};
