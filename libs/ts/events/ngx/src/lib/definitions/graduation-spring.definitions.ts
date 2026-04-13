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
  id: 'graduation-spring',
  name: 'Spring Commencement Ceremony',
  applicationName: 'Spring Commencement Transportation Map',
  shortApplicationName: 'Spring Commencement Map',
  introductionText: 'Get the best transportation and parking information for the spring commencement ceremonies.',
  eventDates: ['2026-05-07', '2026-05-08', '2026-05-09'],
  scheduleUrl: 'https://aggie.tamu.edu/graduation',
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

enum GraduationAttendanceDateChoices {
  DayOne = '2026-05-07T05:00:00.000Z', // May 7, 12AM UTC
  DayTwo = '2026-05-08T05:00:00.000Z', // May 8, 12AM UTC
  DayThree = '2026-05-09T05:00:00.000Z' // May 9, 12AM UTC
}

export const GraduationOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'Please select the day of your commencement or commissioning ceremony to provide the most accurate transportation and parking information.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: [
      { value: GraduationAttendanceDateChoices.DayOne, label: 'Thursday, May 7th' },
      { value: GraduationAttendanceDateChoices.DayTwo, label: 'Friday, May 8th' },
      { value: GraduationAttendanceDateChoices.DayThree, label: 'Saturday, May 9th' }
    ],
    effects: {
      layers: [
        {
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
          conversions: [
            { input: GraduationAttendanceDateChoices.DayOne, propOverrides: { visible: true } },
            { input: GraduationAttendanceDateChoices.DayTwo, propOverrides: { visible: true } },
            { input: GraduationAttendanceDateChoices.DayThree, propOverrides: { visible: true } }
          ]
        }
      ]
    }
  }
];

export const GraduationSpringEventTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for spring graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
