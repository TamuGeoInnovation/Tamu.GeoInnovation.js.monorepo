import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';
import { FAMILY_WEEKEND_LAYERS } from '../interfaces/family-weekend.interface';

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
            } as any,
            label: 'Visitor Parking'
          }
        ]
      }
    }
  }
];

export const FamilyWeekendConfiguration: EventConfiguration = {
  id: 'family-weekend-2025',
  name: 'Family Weekend',
  applicationName: 'Family Weekend Transportation Map',
  shortApplicationName: 'Family Weekend Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2025-04-04', '2025-04-05', '2025-04-06'],
  mapCenter: [-96.3405, 30.61114],
  zoom: 16
};

enum FamilyWeekendAttendanceDateChoices {
  DayOne = '2025-04-04T05:00:00.000Z', //  Apr 4, 12AM UTC
  DayTwo = '2025-04-05T05:00:00.000Z', // Apr5, 12AM UTC
  DayThree = '2025-04-06T05:00:00.000Z', // Apr 6, 12AM UTC
  Conclusion = '2025-04-07T05:00:00.000Z' // Apr 7, 12AM UTC
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
        label: 'Friday, April 4th'
      },
      {
        value: FamilyWeekendAttendanceDateChoices.DayTwo,
        label: 'Saturday, April 5th'
      },
      {
        value: FamilyWeekendAttendanceDateChoices.DayThree,
        label: 'Sunday, April 6th'
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
