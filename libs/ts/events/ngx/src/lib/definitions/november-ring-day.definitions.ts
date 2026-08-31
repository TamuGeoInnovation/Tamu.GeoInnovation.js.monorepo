import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
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

const NOVEMBER_RING_DAY_PERIODS = [
  { value: 'day2', label: 'Aggie Ring Day (November 6, 2026)', dates: ['2026-11-06'] }
] as const;

const novemberRingDayDateConversions = (startField: string, endField: string) =>
  NOVEMBER_RING_DAY_PERIODS.map(({ value, dates }) => ({
    input: value,
    expression: `${startField} <= date'${dates[dates.length - 1]}' AND ${endField} >= date'${dates[0]}'`
  }));

const eventUrl = Connections.ringDayUrl;

const simpleFillSymbol = (
  color: number[],
  outlineColor: number[],
  outlineWidth: number,
  style: 'solid' | 'backward-diagonal' | 'diagonal-cross' = 'solid'
) => ({
  type: 'simple-fill',
  style,
  color,
  outline:
    outlineWidth > 0
      ? {
          type: 'simple-line',
          style: 'solid',
          color: outlineColor,
          width: outlineWidth
        }
      : null
});

// Preserve the hosted layer categories while replacing its solid closure fill with the Move-In hatch.
const ringDayAreaRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    {
      value: 'Accessible',
      label: 'Accessible Path',
      symbol: simpleFillSymbol([0, 112, 255, 255], [110, 110, 110, 255], 0.7)
    },
    {
      value: 'Event Parking',
      label: 'Event Parking',
      symbol: simpleFillSymbol([0, 197, 255, 255], [0, 112, 255, 255], 2)
    },
    {
      value: 'Sales',
      label: 'Aggie Ring Day Marketplace',
      symbol: simpleFillSymbol([56, 168, 0, 255], [110, 110, 110, 255], 0)
    },
    {
      value: 'Ticketed Area',
      label: 'Ticketed Area',
      symbol: simpleFillSymbol([233, 196, 106, 255], [233, 196, 106, 255], 1, 'backward-diagonal')
    },
    {
      value: 'Gathering Area',
      label: 'Gathering Area',
      symbol: simpleFillSymbol([115, 0, 0, 255], [110, 110, 110, 255], 0)
    },
    {
      value: 'Closure',
      label: 'Lot or Street Closure',
      symbol: simpleFillSymbol([230, 0, 0, 255], [230, 0, 0, 255], 1, 'diagonal-cross')
    },
    {
      value: 'The Williams Alumni Center',
      label: 'The Williams Alumni Center',
      symbol: simpleFillSymbol([137, 68, 68, 255], [115, 0, 0, 255], 1, 'diagonal-cross')
    },
    {
      value: '$5 Event Parking',
      label: '$10 Event Parking',
      symbol: simpleFillSymbol([233, 196, 106, 255], [110, 110, 110, 255], 0.7)
    },
    {
      value: 'Lot Specific Permit Required',
      label: 'Lot Specific Permit Required',
      symbol: simpleFillSymbol([244, 162, 97, 255], [110, 110, 110, 255], 0.7)
    }
  ]
} as unknown as NonNullable<NonNullable<FeatureLayerSourceProperties['native']>['renderer']>;

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
      outFields: ['*'],
      renderer: ringDayAreaRenderer
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
  eventDates: NOVEMBER_RING_DAY_PERIODS.flatMap(({ dates }) => dates),
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

export const NovemberRingDaySpecialEventOptions: SpecialEventOptions = [
  {
    value: NovemberRingDayOptions.EVENT_DAY,
    label: 'Event Day',
    description:
      'Select the November Ring Day period you plan to attend to see the most relevant transportation and logistics information.',
    shortDescription: 'Event Day',
    choices: NOVEMBER_RING_DAY_PERIODS.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: [
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_AREAS,
          conversions: novemberRingDayDateConversions('StartDate', 'EndDate')
        },
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_ROUTES,
          conversions: novemberRingDayDateConversions('Start_Date', 'End_Date')
        },
        {
          layerId: NOVEMBER_RING_DAY_LAYERS.RD_POIS,
          conversions: novemberRingDayDateConversions('Start_Date', 'End_Date')
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
