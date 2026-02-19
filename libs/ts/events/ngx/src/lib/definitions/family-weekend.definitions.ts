import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FAMILY_WEEKEND_LAYERS {
  PARKING_LOTS = 'family-weekend-parking-lots',
  VISITOR_PARKING = 'family-weekend-visitor-parking'
}

import esri = __esri;

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Family_Weekend/MapServer';
const visitorParkingUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const FamilyWeekendDefinitions = {
  PARKING_LOTS: {
    id: FAMILY_WEEKEND_LAYERS.PARKING_LOTS,
    layerId: FAMILY_WEEKEND_LAYERS.PARKING_LOTS,
    name: 'Family Weekend Parking Lots',
    url: `${eventUrl}/0`
  },
  VISITOR_PARKING: {
    id: FAMILY_WEEKEND_LAYERS.VISITOR_PARKING,
    layerId: FAMILY_WEEKEND_LAYERS.VISITOR_PARKING,
    name: 'Family Weekend Visitor Parking',
    url: `${visitorParkingUrl}/10`
  }
};

export const FamilyWeekendColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FamilyWeekendDefinitions.PARKING_LOTS.id,
    title: FamilyWeekendDefinitions.PARKING_LOTS.name,
    url: FamilyWeekendDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Type',
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
    id: FamilyWeekendDefinitions.VISITOR_PARKING.id,
    title: FamilyWeekendDefinitions.VISITOR_PARKING.name,
    url: FamilyWeekendDefinitions.VISITOR_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    // popupData: {
    //   name: 'GIS.TS.ParkingLots.LotName',
    //   description: '{GIS.TS.Lot_Notes.VisitorN}'
    // },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'GIS.TS.Lot_Use.Visitor_Lot',
        uniqueValueInfos: [
          {
            value: 1,
            symbol: {
              type: 'simple-fill',
              color: [0, 77, 168, 0.75],
              outline: {
                color: [0, 77, 168, 1],
                width: 1
              }
            } as unknown as esri.SimpleFillSymbolProperties,
            label: 'Visitor Parking'
          }
        ]
      }
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
  DayThree = '2026-04-12T05:00:00.000Z', // Apr 12, 12AM UTC
  Conclusion = '2026-04-13T05:00:00.000Z' // Apr 13, 12AM UTC
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
          layerId: FAMILY_WEEKEND_LAYERS.PARKING_LOTS,
          conversions: [
            {
              input: FamilyWeekendAttendanceDateChoices.DayOne,
              expression: `StartDate < date'${new Date(
                FamilyWeekendAttendanceDateChoices.DayTwo
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.DayTwo
              ).toLocaleTimeString()}' AND EndDate > date'${new Date(
                FamilyWeekendAttendanceDateChoices.DayOne
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.DayOne
              ).toLocaleTimeString()}' OR (StartDate IS NULL AND EndDate IS NULL)`
            },
            {
              input: FamilyWeekendAttendanceDateChoices.DayTwo,
              expression: `StartDate < date'${new Date(
                FamilyWeekendAttendanceDateChoices.DayThree
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.DayThree
              ).toLocaleTimeString()}' AND EndDate > date'${new Date(
                FamilyWeekendAttendanceDateChoices.DayTwo
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.DayTwo
              ).toLocaleTimeString()}' OR (StartDate IS NULL AND EndDate IS NULL)`
            },
            {
              input: FamilyWeekendAttendanceDateChoices.DayThree,
              expression: `StartDate < date'${new Date(
                FamilyWeekendAttendanceDateChoices.Conclusion
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.Conclusion
              ).toLocaleTimeString()}' AND EndDate > date'${new Date(
                FamilyWeekendAttendanceDateChoices.DayThree
              ).toLocaleDateString()} ${new Date(
                FamilyWeekendAttendanceDateChoices.DayThree
              ).toLocaleTimeString()}' OR (StartDate IS NULL AND EndDate IS NULL)`
            }
          ]
        },
        {
          layerId: FAMILY_WEEKEND_LAYERS.VISITOR_PARKING,
          conversions: [
            {
              input: FamilyWeekendAttendanceDateChoices.DayOne,
              expression: '0=1'
            },
            {
              input: FamilyWeekendAttendanceDateChoices.DayTwo,
              expression: '0=1'
            },
            {
              input: FamilyWeekendAttendanceDateChoices.DayThree,
              expression: 'GIS.TS.Lot_Use.Visitor_Lot = 1'
            }
          ]
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
