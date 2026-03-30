import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FAMILY_WEEKEND_LAYERS {
  FRIDAY_PARKING_LOTS = 'family-weekend-friday-parking-lots',
  SATURDAY_PARKING_LOTS = 'family-weekend-saturday-parking-lots',
  SUNDAY_PARKING_LOTS = 'family-weekend-sunday-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/Family_Weekend/MapServer';

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
    title: FamilyWeekendDefinitions.FRIDAY_PARKING_LOTS.name,
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
    title: FamilyWeekendDefinitions.SATURDAY_PARKING_LOTS.name,
    url: FamilyWeekendDefinitions.SATURDAY_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: false,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.SUNDAY_PARKING_LOTS.id,
    title: FamilyWeekendDefinitions.SUNDAY_PARKING_LOTS.name,
    url: FamilyWeekendDefinitions.SUNDAY_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: false,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const FamilyWeekendConfiguration: EventConfiguration = {
  id: 'family-weekend-2026',
  name: 'Family Weekend',
  applicationName: 'Family Weekend Transportation Map',
  shortApplicationName: 'Family Weekend Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2026-04-10', '2026-04-11', '2026-04-12'],
  mapCenter: [-96.3405, 30.61114],
  zoom: 16
};

enum FamilyWeekendAttendanceDateChoices {
  DayOne = '2026-04-10T05:00:00.000Z', //  Apr 10, 12AM UTC
  DayTwo = '2026-04-11T05:00:00.000Z', // Apr 11, 12AM UTC
  DayThree = '2026-04-12T05:00:00.000Z' // Apr 12, 12AM UTC
}

export const FamilyWeekendOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'To best provide you with the most accurate parking information, please select the day you plan to attend Family Weekend.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: [
      {
        value: FamilyWeekendAttendanceDateChoices.DayOne,
        label: 'Friday, April 10th'
      },
      {
        value: FamilyWeekendAttendanceDateChoices.DayTwo,
        label: 'Saturday, April 11th'
      },
      {
        value: FamilyWeekendAttendanceDateChoices.DayThree,
        label: 'Sunday, April 12th'
      }
    ],
    effects: {
      layers: [
        {
          layerId: FAMILY_WEEKEND_LAYERS.FRIDAY_PARKING_LOTS,
          conversions: [{ input: FamilyWeekendAttendanceDateChoices.DayOne, propOverrides: { visible: true } }]
        },
        {
          layerId: FAMILY_WEEKEND_LAYERS.SATURDAY_PARKING_LOTS,
          conversions: [{ input: FamilyWeekendAttendanceDateChoices.DayTwo, propOverrides: { visible: true } }]
        },
        {
          layerId: FAMILY_WEEKEND_LAYERS.SUNDAY_PARKING_LOTS,
          conversions: [{ input: FamilyWeekendAttendanceDateChoices.DayThree, propOverrides: { visible: true } }]
        }
      ]
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
    keywords: ['family', 'weekend', 'parking', 'shuttles', 'transportation']
  }
};
