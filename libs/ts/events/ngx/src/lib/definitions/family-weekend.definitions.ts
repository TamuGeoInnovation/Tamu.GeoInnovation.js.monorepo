import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

export enum FAMILY_WEEKEND_LAYERS {
  FRIDAY_PARKING_LOTS = 'family-weekend-friday-parking-lots',
  SATURDAY_PARKING_LOTS = 'family-weekend-saturday-parking-lots',
  SUNDAY_PARKING_LOTS = 'family-weekend-sunday-parking-lots'
}

const eventUrl = Connections.familyWeekendUrl;

export const FamilyWeekendDefinitions = {
  FRIDAY_PARKING_LOTS: {
    id: FAMILY_WEEKEND_LAYERS.FRIDAY_PARKING_LOTS,
    layerId: FAMILY_WEEKEND_LAYERS.FRIDAY_PARKING_LOTS,
    name: 'Friday Parking Lots',
    url: `${eventUrl}/0`
  },
  SATURDAY_PARKING_LOTS: {
    id: FAMILY_WEEKEND_LAYERS.SATURDAY_PARKING_LOTS,
    layerId: FAMILY_WEEKEND_LAYERS.SATURDAY_PARKING_LOTS,
    name: 'Saturday Parking Lots',
    url: `${eventUrl}/1`
  },
  SUNDAY_PARKING_LOTS: {
    id: FAMILY_WEEKEND_LAYERS.SUNDAY_PARKING_LOTS,
    layerId: FAMILY_WEEKEND_LAYERS.SUNDAY_PARKING_LOTS,
    name: 'Sunday Parking Lots',
    url: `${eventUrl}/2`
  }
};

export const FamilyWeekendColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.FRIDAY_PARKING_LOTS.id,
    url: FamilyWeekendDefinitions.FRIDAY_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: false,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.SATURDAY_PARKING_LOTS.id,
    url: FamilyWeekendDefinitions.SATURDAY_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: false,
    listMode: 'show',
    native: {
      outFields: ['*']
} as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.SUNDAY_PARKING_LOTS.id,
    url: FamilyWeekendDefinitions.SUNDAY_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: false,
    listMode: 'show',
    native: {
      outFields: ['*']
} as unknown as FeatureNative
  }
];

const FAMILY_WEEKEND_DATES = [
  {
    eventDate: '2026-04-10',
    value: '2026-04-10T05:00:00.000Z',
    label: 'Friday, April 10th',
    layerId: FAMILY_WEEKEND_LAYERS.FRIDAY_PARKING_LOTS
  },
  {
    eventDate: '2026-04-11',
    value: '2026-04-11T05:00:00.000Z',
    label: 'Saturday, April 11th',
    layerId: FAMILY_WEEKEND_LAYERS.SATURDAY_PARKING_LOTS
  },
  {
    eventDate: '2026-04-12',
    value: '2026-04-12T05:00:00.000Z',
    label: 'Sunday, April 12th',
    layerId: FAMILY_WEEKEND_LAYERS.SUNDAY_PARKING_LOTS
  }
] as const;

export const FamilyWeekendConfiguration: EventConfiguration = {
  id: 'family-weekend-2026',
  name: 'Family Weekend',
  applicationName: 'Family Weekend Transportation Map',
  shortApplicationName: 'Family Weekend Map',
  introductionText: 'Get the best parking information for',
  eventDates: FAMILY_WEEKEND_DATES.map(({ eventDate }) => eventDate),
  scheduleUrl: 'https://familyweekend.tamu.edu/',
  mapCenter: [-96.3405, 30.61114],
  zoom: 16
};

export const FamilyWeekendOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'To best provide you with the most accurate parking information, please select the day you plan to attend Family Weekend.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: FAMILY_WEEKEND_DATES.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: FAMILY_WEEKEND_DATES.map(({ layerId, value }) => ({
        layerId,
        conversions: [{ input: value, propOverrides: { visible: true } }]
      }))
    }
  }
];

export const FamilyWeekendTs: AggiemapCustomMapConfiguration = {
  configuration: FamilyWeekendConfiguration,
  options: FamilyWeekendOptions,
  sources: FamilyWeekendColdLayerSources,
  references: FAMILY_WEEKEND_LAYERS,
  type: 'special-event',
  discover: {
    id: FamilyWeekendConfiguration.id,
    name: FamilyWeekendConfiguration.name,
    description: 'Transportation and parking information for Family Weekend.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['family', 'weekend', 'parking', 'shuttles', 'transportation']
  }
};
