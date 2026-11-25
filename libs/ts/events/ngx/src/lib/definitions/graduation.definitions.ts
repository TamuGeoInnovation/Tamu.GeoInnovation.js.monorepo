import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

/**
 * The layers of both Graduation maps, Fall and Spring, which draw one service and differ only in their dates. Kept
 * here once: two copies of these were two places to repoint when the service changed (#2530).
 */

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

// Drawn in this order, top first (docs/map-layers.md, "Drawing order"), as the map has drawn them: the road closures
// on top, and the lots at the bottom, whose fill would cover the rest (#2061).
export enum GRADUATION_LAYERS {
  GRADUATION_ROAD_CLOSURES = 'graduation-road-closed',
  GRADUATION_ACCESSIBLE_PARKING = 'graduation-accessible-parking',
  GRADUATION_TRAFFIC_FLOW = 'graduation-traffic-flow',
  GRADUATION_EVENT_PARKING_LOTS = 'graduation-event-parking-lots'
}

// Republished on 28 October 2026 with the closures split out of the lots (#2530): 0 Accessible Parking, 1 Traffic
// Flow, 2 Road Closures, 3 Event Parking, on both environments.
const eventUrl = Connections.graduationParkingUrl;

const graduationParkingLabelingInfo = [
  {
    labelExpressionInfo: {
      expression: '$feature.name'
    },
    maxScale: 0,
    minScale: 0,
    useCodedValues: true,
    symbol: {
      type: 'text',
      color: [0, 0, 0, 255],
      haloColor: [255, 255, 255, 255],
      haloSize: 1.5,
      font: {
        family: 'Open Sans Semibold',
        size: 10,
        weight: 'bold'
      }
    }
  }
] as unknown as esri.LabelClassProperties[];

export const GraduationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_ACCESSIBLE_PARKING,
    url: `${eventUrl}/0`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    url: `${eventUrl}/1`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    url: `${eventUrl}/3`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      // The Event Parking layer (3) also holds the two road closures that layer 2 draws - Olsen Blvd and Reed Arena Loop,
      // with the same object ids and shapes - on both hosts: 15 features, 2 of them `type = 'Closure'`, measured on
      // 8 November 2026 (#2764). Without this filter every graduation map would draw them as parking as well. This
      // comment used to say development's view held none, and to remove the filter once production matched it; whether
      // that was ever true is unrecorded, and development holds them now, so the hosts agreeing is no reason to remove it.
      // Remove it only when the service stops storing them twice: when
      // `GraduationParking_view/FeatureServer/3/query?where=type='Closure'&returnCountOnly=true` answers 0 on both hosts.
      definitionExpression: `Type <> 'Closure'`,
      labelingInfo: graduationParkingLabelingInfo
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    url: `${eventUrl}/2`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'Road Closed',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  }
];

/**
 * One commencement day, as the builder offers it. Each one is written out, because the facts differ legitimately
 * between seasons: `value` is midnight in College Station, so 05:00Z in May (CDT) and 06:00Z in December (CST), and
 * the weekday labels are the registrar's. A factory that derived them would have to be right about both (#2599, #2759).
 */
export interface GraduationDate {
  eventDate: string;
  value: string;
  label: string;
}

/**
 * A commencement map, Fall's or Spring's, from its season and its days (#2599). The two drew the same layers, offered
 * the same choice and said the same things in their own season's name; each file now holds only its dates, so a new
 * option or wording is made here once. `move-out.definitions.ts`'s `moveOutPeriod` is the same pattern.
 */
export function graduationMap(season: 'Fall' | 'Spring', dates: ReadonlyArray<GraduationDate>) {
  const key = season.toLowerCase();

  const configuration: EventConfiguration = {
    id: `graduation-${key}`,
    name: `${season} Commencement Ceremony`,
    applicationName: `${season} Commencement Transportation Map`,
    shortApplicationName: `${season} Commencement Map`,
    introductionText: `Get the best transportation and parking information for the ${key} commencement ceremonies.`,
    eventDates: dates.map(({ eventDate }) => eventDate),
    scheduleUrl: 'https://graduation.tamu.edu/ceremony-information/index.html',
    mapCenter: [-96.34458, 30.60629],
    zoom: 16
  };

  const options: SpecialEventOptions = [
    {
      value: 'date',
      description:
        'Please select the day of your commencement or commissioning ceremony to provide the most accurate transportation and parking information.',
      shortDescription: 'Event Day',
      label: 'Event Day',
      choices: dates.map(({ value, label }) => ({ value, label })),
      effects: {
        layers: [
          {
            layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
            conversions: dates.map(({ value }) => ({
              input: value,
              propOverrides: {
                visible: true
              }
            }))
          }
        ]
      }
    }
  ];

  const event: AggiemapCustomMapConfiguration = {
    type: 'special-event',
    configuration,
    options,
    sources: GraduationColdLayerSources,
    references: GRADUATION_LAYERS,
    discover: {
      id: configuration.id,
      name: configuration.name,
      description: `Transportation and parking information for ${key} graduation ceremonies.`,
      source: 'internal',
      type: 'event',
      columnKey: key,
      keywords: ['graduation', 'commencement', 'parking', 'transportation']
    }
  };

  return { configuration, options, event };
}
