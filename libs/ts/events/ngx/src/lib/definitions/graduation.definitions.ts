import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { GRADUATION_LAYERS } from '../interfaces/graduation.interface';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/GraduationMuster/MapServer';

const GraduationEventDefinitions = {
  GRADUATION_TRAFFIC_FLOW: {
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    layerId: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    name: 'Graduation Traffic Flow',
    url: `${eventUrl}/1`
  },
  GRADUATION_LINE_PAINT: {
    id: GRADUATION_LAYERS.GRADUATION_LINE_PAINT,
    layerId: GRADUATION_LAYERS.GRADUATION_LINE_PAINT,
    name: 'Graduation Line Paint',
    url: `${eventUrl}/2`
  },
  GRADUATION_CONSTRUCTION: {
    id: GRADUATION_LAYERS.GRADUATION_CONSTRUCTION,
    layerId: GRADUATION_LAYERS.GRADUATION_CONSTRUCTION,
    name: 'Graduation Construction',
    url: `${eventUrl}/3`
  },
  GRADUATION_EVENT_PARKING_LOTS: {
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    name: 'Graduation Event Parking Lots',
    url: `${eventUrl}/4`
  },
  GRADUATION_ROAD_CLOSURES: {
    id: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    layerId: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    name: 'Graduation Road Closures',
    url: `${eventUrl}/7`
  }
};

export const GraduationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.id,
    title: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.name,
    url: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.STF_Notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          {
            value: 'Green',
            label: 'Recommended Routes',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 3,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            }
          },
          {
            value: 'Red',
            label: 'Expect Delays',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2,
              marker: {
                style: 'arrow',
                color: 'rgb(230, 0, 0)',
                placement: 'end'
              }
            }
          }
        ]
      } as any,
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '$feature.STF_Notes'
          },
          minScale: 0,
          maxScale: 0,
          useCodedValues: true,
          allowOverrun: true,
          symbol: {
            type: 'text', // autocasts as new TextSymbol()
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              // autocast as new Font()
              family: 'Arial Unicode MS',
              size: 12,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_LINE_PAINT.id,
    title: GraduationEventDefinitions.GRADUATION_LINE_PAINT.name,
    url: GraduationEventDefinitions.GRADUATION_LINE_PAINT.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    visible: false,
    native: {
      listMode: 'hide',
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_CONSTRUCTION.id,
    title: GraduationEventDefinitions.GRADUATION_CONSTRUCTION.name,
    url: GraduationEventDefinitions.GRADUATION_CONSTRUCTION.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    visible: false,
    listMode: 'hide',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.id,
    title: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.name,
    url: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.GraduationN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '"Lot 97" + TextFormatting.NewLine + "Available After 5PM Friday"'
          },
          maxScale: 0,
          minScale: 0,
          where: "GIS.TS.ParkingLots.Name = '97'",
          useCodedValues: true,
          allowOverrun: true,
          symbol: {
            type: 'text', // autocasts as new TextSymbol()
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              // autocast as new Font()
              family: 'Arial Unicode MS',
              size: 12,
              weight: 'bold'
            }
          }
        },
        {
          labelExpressionInfo: {
            expression: '$feature["GIS.TS.ParkingLots.LotName"]'
          },
          maxScale: 0,
          minScale: 0,
          where: "GIS.TS.ParkingLots.Name NOT LIKE '97'",
          useCodedValues: true,
          symbol: {
            type: 'text', // autocasts as new TextSymbol()
            color: 'black',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              // autocast as new Font()
              family: 'Arial Unicode MS',
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.id,
    title: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.name,
    url: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.A_Name',
      description: 'attributes.SP_SH_Notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '$feature.SP_SH_Notes'
          },
          minScale: 0,
          maxScale: 0,
          useCodedValues: true,
          allowOverrun: true,
          symbol: {
            type: 'text', // autocasts as new TextSymbol()
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              // autocast as new Font()
              family: 'Arial Unicode MS',
              size: 12,
              weight: 'bold'
            }
          }
        }
      ]
    }
  }
];

export const GraduationConfiguration: EventConfiguration = {
  id: 'graduation-2025',
  name: 'Graduation',
  applicationName: 'Graduation Transportation Map',
  shortApplicationName: 'Graduation Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2025-05-08', '2025-05-09', '2025-05-10'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

enum GraduationAttendanceDateChoices {
  DayOne = '2025-04-08T05:00:00.000Z', //  Apr 4, 12AM UTC
  DayTwo = '2025-04-09T05:00:00.000Z', // Apr5, 12AM UTC
  DayThree = '2025-04-10T05:00:00.000Z', // Apr 6, 12AM UTC
  Conclusion = '2025-04-11T05:00:00.000Z' // Apr 7, 12AM UTC
}

export const GraduationOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'To best provide you with the most accurate parking information, please select the day of your graduation ceremony.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: [
      {
        value: GraduationAttendanceDateChoices.DayOne,
        label: 'Thursday, May 8th'
      },
      {
        value: GraduationAttendanceDateChoices.DayTwo,
        label: 'Friday, May 9th'
      },
      {
        value: GraduationAttendanceDateChoices.DayThree,
        label: 'Saturday, May 10th'
      }
    ],
    effects: {}
  }
];
