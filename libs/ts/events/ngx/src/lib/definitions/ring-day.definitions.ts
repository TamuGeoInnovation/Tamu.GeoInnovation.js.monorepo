import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';
import { EventPeriod, periodDateConversions } from './common.definitions';

/**
 * The Ring Day maps, October's, November's and April's, built from one factory (#2599).
 *
 * The three draw the same service with the same layers, popups and filters, and differ only in their dates, their names
 * and a few words. Each map's own file holds those facts and nothing else, so a new filter rule or popup is made here,
 * once, for every Ring Day. `move-out.definitions.ts`'s `moveOutPeriod` is the same pattern.
 */

export enum RING_DAY_LAYERS {
  RD_POIS = 'ring-day-pois',
  RD_ROUTES = 'ring-day-routes',
  RD_AREAS = 'ring-day-areas'
}

/** A Ring Day period: a builder choice, the days it covers, and the view it opens on. */
export interface RingDayPeriod extends EventPeriod {
  label: string;
  mapView: { center: readonly [number, number]; zoom: number };
}

/** What one Ring Day map says that the others do not. */
export interface RingDayFacts {
  /** In every shared link and saved setting, so it never changes. */
  id: string;
  /** The map's name, such as "October Ring Day". */
  name: string;
  /** What the notification calls the event: October's says only "Ring Day". */
  toastName: string;
  /** The builder's question, worded per map. */
  periodDescription: string;
  /** The Campus Maps page's column. */
  columnKey: string;
  periods: ReadonlyArray<RingDayPeriod>;
}

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

/** The three layers every Ring Day map draws. A new list each call, so one map's never is another's. */
const ringDaySources = (): LayerSource[] => [
  {
    type: 'feature',
    id: RingDayEventDefinitions.RD_AREAS.id,
    title: RingDayEventDefinitions.RD_AREAS.name,
    url: RingDayEventDefinitions.RD_AREAS.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
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

/** One Ring Day map, from its facts: the parts each map's file exports, and the map itself. */
export function ringDayMap(facts: RingDayFacts) {
  const { id, name, toastName, periods } = facts;

  const sources = ringDaySources();

  const configuration: EventConfiguration = {
    id,
    name,
    applicationName: `${name} Transportation Map`,
    shortApplicationName: `${name} Map`,
    introductionText: `Get the best transportation and logistics information for ${name}.`,
    eventDates: periods.flatMap(({ dates }) => dates),
    scheduleUrl: 'https://www.aggienetwork.com/ring/ringday/',
    mapCenter: [-96.33616, 30.60958],
    zoom: 16,
    defaultLayerOverrides: {
      'construction_zone-layer': {
        visible: false
      }
    },
    toast: {
      id: `${id}-notification`,
      title: `${toastName} Transportation Map Available`,
      message: `Attending ${toastName}? Click me to open the ${toastName} Transportation Map to get the best logistics and transportation information!`,
      imgUrl: './assets/images/icons/aggie/Ring Day-Negative.png',
      imgAltText: `${toastName} Icon`,
      acknowledge: true,
      action: {
        type: 'internal',
        value: `/events/${id}`
      }
    }
  };

  // October's and April's files also carried an "Accessible Accommodations" option, commented out, filtering the
  // areas layer on `Type LIKE '%ADA%'`. It was never offered; restore it here, once, if it is wanted.
  const options: SpecialEventOptions = [
    {
      value: 'event-day',
      label: 'Event Day',
      description: facts.periodDescription,
      shortDescription: 'Event Day',
      choices: periods.map(({ value, label, mapView }) => ({
        value,
        label,
        mapView: { center: [...mapView.center] as [number, number], zoom: mapView.zoom }
      })),
      effects: {
        layers: [
          {
            layerId: RING_DAY_LAYERS.RD_AREAS,
            conversions: periodDateConversions(periods, 'StartDate', 'EndDate')
          },
          {
            layerId: RING_DAY_LAYERS.RD_ROUTES,
            conversions: periodDateConversions(periods, 'Start_Date', 'End_Date')
          },
          {
            layerId: RING_DAY_LAYERS.RD_POIS,
            conversions: periodDateConversions(periods, 'Start_Date', 'End_Date')
          }
        ]
      }
    }
  ];

  const event: AggiemapCustomMapConfiguration = {
    type: 'special-event',
    configuration,
    options,
    sources,
    references: RING_DAY_LAYERS,
    discover: {
      id,
      name,
      description: `Transportation and logistics information for ${name} celebrations.`,
      source: 'internal',
      type: 'event',
      columnKey: facts.columnKey,
      keywords: ['ring', 'day', 'aggie', 'ring day', 'transportation', 'parking', 'celebration']
    }
  };

  return { configuration, options, sources, event };
}
