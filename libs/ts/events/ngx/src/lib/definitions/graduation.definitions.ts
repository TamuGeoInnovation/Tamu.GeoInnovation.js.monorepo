import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum GRADUATION_LAYERS {
  GRADUATION_EVENT_PARKING_LOTS_A = 'graduation-event-parking-lots-a',
  GRADUATION_EVENT_PARKING_LOTS_B = 'graduation-event-parking-lots-b',
  GRADUATION_TRAFFIC_FLOW = 'graduation-traffic-flow'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/GraduationMuster/MapServer';

const GraduationEventDefinitions = {
  GRADUATION_TRAFFIC_FLOW: {
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    layerId: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    name: 'Graduation Traffic Flow',
    url: `${eventUrl}/1`
  },
  GRADUATION_EVENT_PARKING_LOTS_A: {
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_A,
    layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_A,
    name: 'Graduation Event Parking Lots',
    url: `${eventUrl}/4`
  },
  GRADUATION_EVENT_PARKING_LOTS_B: {
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_B,
    layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_B,
    name: 'Graduation Event Parking Lots',
    url: `${eventUrl}/5`
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
            } as unknown as esri.SimpleLineSymbolProperties
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
            } as unknown as esri.SimpleLineSymbolProperties
          }
        ]
      },
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
            type: 'text',
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            font: {
              family: 'Arial Unicode MS',
              size: 12,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },

  // Event Parking Lots A
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_A.id,
    title: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_A.name,
    url: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_A.url,
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
            type: 'text',
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
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
            type: 'text',
            color: 'black',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              family: 'Arial Unicode MS',
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },

  // Event Parking Lots B
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_B.id,
    title: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_B.name,
    url: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS_B.url,
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
            type: 'text',
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
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
            type: 'text',
            color: 'black',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              family: 'Arial Unicode MS',
              size: 10,
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
  introductionText: 'Get the best transportation and parking information for the commencement and commissioning ceremonies.',
  eventDates: ['2025-12-17', '2025-12-18'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

enum GraduationAttendanceDateChoices {
  DayOne = '2025-12-17T05:00:00.000Z',
  DayTwo = '2025-12-18T05:00:00.000Z'
}

export const GraduationOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'Please select the day of your commencement or commissioning ceremony to provide the most accurate transportation and parking information.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: [
      {
        value: GraduationAttendanceDateChoices.DayOne,
        label: 'Wednesday, December 17th'
      },
      {
        value: GraduationAttendanceDateChoices.DayTwo,
        label: 'Thursday, December 18th'
      }
    ],
    effects: {
      layers: [
        {
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_A,
          conversions: [
            { input: GraduationAttendanceDateChoices.DayOne, propOverrides: { visible: true } },
            { input: GraduationAttendanceDateChoices.DayTwo, propOverrides: { visible: false } }
          ]
        },
        {
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS_B,
          conversions: [
            { input: GraduationAttendanceDateChoices.DayOne, propOverrides: { visible: false } },
            { input: GraduationAttendanceDateChoices.DayTwo, propOverrides: { visible: true } }
          ]
        }
      ]
    }
  }
];

export const GraduationEventTs: ISpecialEventRoot = {
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
