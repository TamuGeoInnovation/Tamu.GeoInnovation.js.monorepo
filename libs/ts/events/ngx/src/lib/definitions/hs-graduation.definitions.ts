import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { commonSymbols } from './common.definitions';

export enum HS_GRADUATION_LAYERS {
  ROUTES = 'hs-graduation-routes',
  PARKING_LOTS = 'hs-graduation-parking-lots',
  TRAFFIC_ADVISORIES = 'hs-graduation-traffic-advisories'
}

const eventUrl = Connections('gis.it.tamu.edu').hsGraduationUrl;

const HsGraduationEventDefinitions = {
  GRADUATION_TRAFFIC_FLOW: {
    id: HS_GRADUATION_LAYERS.ROUTES,
    layerId: HS_GRADUATION_LAYERS.ROUTES,
    name: 'High School Graduation Routes',
    url: `${eventUrl}/0`
  },
  GRADUATION_PARKING_LOTS: {
    id: HS_GRADUATION_LAYERS.PARKING_LOTS,
    layerId: HS_GRADUATION_LAYERS.PARKING_LOTS,
    name: 'High School Graduation Parking',
    url: `${eventUrl}/1`
  },
  GRADUATION_TRAFFIC_ADVISORIES: {
    id: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES,
    layerId: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES,
    name: 'Traffic Advisories',
    url: `${eventUrl}/2`
  }
};

export const HsGraduationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.id,
    title: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.name,
    url: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.name,
      description: 'attributes.name'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'name',
        uniqueValueInfos: [
          {
            value: 'Departing - Recommended Route',
            label: 'Fast Route',
            symbol: commonSymbols.GREEN_ARROW
          },
          {
            value: 'Fast Route',
            label: 'Fast Route',
            symbol: commonSymbols.GREEN_ARROW
          },
          {
            value: 'Expect Delays',
            label: 'Expect Delays',
            symbol: commonSymbols.RED_ARROW
          }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: HsGraduationEventDefinitions.GRADUATION_PARKING_LOTS.id,
    title: HsGraduationEventDefinitions.GRADUATION_PARKING_LOTS.name,
    url: HsGraduationEventDefinitions.GRADUATION_PARKING_LOTS.url,
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
    id: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_ADVISORIES.id,
    title: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_ADVISORIES.name,
    url: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_ADVISORIES.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: HsGraduationEventDefinitions.GRADUATION_TRAFFIC_ADVISORIES.name,
      description: 'attributes.name'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const HsGraduationConfiguration: EventConfiguration = {
  id: 'hs-graduation-2025',
  name: 'High School Graduation',
  applicationName: 'High School Graduation Transportation Map',
  shortApplicationName: 'High School Graduation Map',
  introductionText: 'Get the best transportation and parking information for the high school graduation ceremonies.',
  eventDates: ['2025-05-24', '2025-05-25'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

enum HsGraduationEventChoices {
  Arrival = 'arrival',
  Departure = 'departure'
}

export const HsGraduationOptions: SpecialEventOptions = [
  {
    value: 'type',
    description:
      'Please select the graduation map type to provide the most accurate transportation and parking information.',
    shortDescription: 'Type',
    label: 'Type',
    choices: [
      {
        value: HsGraduationEventChoices.Arrival,
        label: 'Arrival'
      },
      {
        value: HsGraduationEventChoices.Departure,
        label: 'Departure'
      }
    ],
    effects: {
      layers: [
        {
          layerId: HS_GRADUATION_LAYERS.ROUTES,
          field: 'name',
          conversions: [
            {
              input: HsGraduationEventChoices.Arrival,
              expression: "name = 'Fast Route' OR name = 'Expect Delays'"
            },
            {
              input: HsGraduationEventChoices.Departure,
              output: 'Departing - Recommended Route'
            }
          ]
        },
        {
          layerId: HS_GRADUATION_LAYERS.PARKING_LOTS,
          conversions: [
            {
              input: HsGraduationEventChoices.Arrival,
              expression: "Type NOT IN ('Departure - Closure')"
            },
            {
              input: HsGraduationEventChoices.Departure,
              expression: "Type NOT IN ('Closure')"
            }
          ]
        },
        {
          layerId: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES,
          conversions: [
            {
              input: HsGraduationEventChoices.Arrival,
              propOverrides: {
                visible: false,
                listMode: 'hide'
              }
            },
            {
              input: HsGraduationEventChoices.Departure,
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

export const HsGraduationTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: HsGraduationConfiguration,
  sources: HsGraduationColdLayerSources,
  options: HsGraduationOptions,
  references: HS_GRADUATION_LAYERS,
  discover: {
    id: HsGraduationConfiguration.id,
    name: HsGraduationConfiguration.name,
    description: 'Transportation and parking information for high school graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['high school', 'graduation', 'parking', 'transportation']
  }
};
