import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum GRADUATION_LAYERS {
  GRADUATION_TRAFFIC_FLOW = 'graduation-traffic-flow',
  GRADUATION_EVENT_PARKING_LOTS = 'graduation-event-parking-lots',
  GRADUATION_ROAD_CLOSURES = 'graduation-road-closed'
}
const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/GraduationParking/MapServer';

const GraduationEventDefinitions = {
  GRADUATION_TRAFFIC_FLOW: {
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    layerId: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    name: 'Graduation Traffic Flow',
    url: `${eventUrl}/0`
  },
  GRADUATION_EVENT_PARKING_LOTS: {
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    name: 'Graduation Event Parking Lots',
    url: `${eventUrl}/1`
  },
  GRADUATION_ROAD_CLOSURES: {
    id: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    layerId: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    name: 'Road Closed',
    url: `${eventUrl}/2`
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
      name: '{attributes.Event}',
      description: '{attributes.STF_Notes}'
    },
    visible: true,
    listMode: 'show',
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
        field: 'GIS.TS.ParkingLots.Name',
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
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.id,
    title: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.name,
    url: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.A_Name}',
      description: '{attributes.SP_SH_Notes}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const GraduationConfiguration: EventConfiguration = {
  id: 'graduation-fall',
  name: 'Fall Commencement Ceremony',
  applicationName: 'Fall Commencement Transportation Map',
  shortApplicationName: 'Fall Commencement Map',
  introductionText: 'Get the best transportation and parking information for the fall commencement ceremonies.',
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
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
          conversions: [
            {
              input: GraduationAttendanceDateChoices.DayOne,
              propOverrides: {
                visible: true
              }
            },
            {
              input: GraduationAttendanceDateChoices.DayTwo,
              propOverrides: {
                visible: true
              }
            }
          ]
        }
      ]
    }
  }
];

export const GraduationFallEventTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for fall graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
