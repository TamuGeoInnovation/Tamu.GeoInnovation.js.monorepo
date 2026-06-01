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

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

export enum HS_GRADUATION_LAYERS {
  ARRIVAL_GROUP = 'hs-graduation-arrival-group',
  ACCESSIBLE_BUS_PARKING = 'hs-graduation-accessible-bus-parking',
  ARRIVAL_ROUTES = 'hs-graduation-arrival-routes',
  ARRIVAL_PARKING = 'hs-graduation-arrival-parking',
  DEPARTURE_GROUP = 'hs-graduation-departure-group',
  DEPARTURE_ROUTES = 'hs-graduation-departure-routes',
  TRAFFIC_ADVISORIES = 'hs-graduation-traffic-advisories',
  DEPARTURE_PARKING = 'hs-graduation-departure-parking'
}

const eventUrl = Connections.hsGraduationUrl;

const HsGraduationEventDefinitions = {
  ARRIVAL_GROUP: {
    id: HS_GRADUATION_LAYERS.ARRIVAL_GROUP,
    name: 'Arrival',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_BUS_PARKING: {
    id: HS_GRADUATION_LAYERS.ACCESSIBLE_BUS_PARKING,
    name: 'Accessible/Bus Parking',
    url: `${eventUrl}/1`
  },
  ARRIVAL_ROUTES: {
    id: HS_GRADUATION_LAYERS.ARRIVAL_ROUTES,
    name: 'Arrival Recommended Routes',
    url: `${eventUrl}/2`
  },
  ARRIVAL_PARKING: {
    id: HS_GRADUATION_LAYERS.ARRIVAL_PARKING,
    name: 'High School Graduation Parking',
    url: `${eventUrl}/3`
  },
  DEPARTURE_GROUP: {
    id: HS_GRADUATION_LAYERS.DEPARTURE_GROUP,
    name: 'Departure',
    url: `${eventUrl}/4`
  },
  DEPARTURE_ROUTES: {
    id: HS_GRADUATION_LAYERS.DEPARTURE_ROUTES,
    name: 'Departure Recommended Routes',
    url: `${eventUrl}/5`
  },
  TRAFFIC_ADVISORIES: {
    id: HS_GRADUATION_LAYERS.TRAFFIC_ADVISORIES,
    name: 'Departure Traffic Advisories',
    url: `${eventUrl}/6`
  },
  DEPARTURE_PARKING: {
    id: HS_GRADUATION_LAYERS.DEPARTURE_PARKING,
    name: 'Parking/Closures',
    url: `${eventUrl}/7`
  }
};

const HsGraduationLayerReferences: Record<string, string> = {
  ARRIVAL_GROUP: HS_GRADUATION_LAYERS.ARRIVAL_GROUP,
  DEPARTURE_GROUP: HS_GRADUATION_LAYERS.DEPARTURE_GROUP
};

export const HsGraduationColdLayerSources: LayerSource[] = [
  {
    type: 'group',
    id: HsGraduationEventDefinitions.ARRIVAL_GROUP.id,
    title: HsGraduationEventDefinitions.ARRIVAL_GROUP.name,
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    sources: [
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.ARRIVAL_PARKING.id,
        title: HsGraduationEventDefinitions.ARRIVAL_PARKING.name,
        url: HsGraduationEventDefinitions.ARRIVAL_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'Type' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.ARRIVAL_ROUTES.id,
        title: HsGraduationEventDefinitions.ARRIVAL_ROUTES.name,
        url: HsGraduationEventDefinitions.ARRIVAL_ROUTES.url,
        popupComponent: MarkdownPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
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
          } as unknown as esri.UniqueValueRendererProperties
        } as unknown as FeatureNative
      },
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.id,
        title: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.name,
        url: HsGraduationEventDefinitions.ACCESSIBLE_BUS_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  },
  {
    type: 'group',
    id: HsGraduationEventDefinitions.DEPARTURE_GROUP.id,
    title: HsGraduationEventDefinitions.DEPARTURE_GROUP.name,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    sources: [
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.DEPARTURE_PARKING.id,
        title: HsGraduationEventDefinitions.DEPARTURE_PARKING.name,
        url: HsGraduationEventDefinitions.DEPARTURE_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'Type' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.id,
        title: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.name,
        url: HsGraduationEventDefinitions.TRAFFIC_ADVISORIES.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: HsGraduationEventDefinitions.DEPARTURE_ROUTES.id,
        title: HsGraduationEventDefinitions.DEPARTURE_ROUTES.name,
        url: HsGraduationEventDefinitions.DEPARTURE_ROUTES.url,
        popupComponent: MarkdownPopupComponent,
        popupData: {
          name: { field: 'Notes' },
          description: { field: 'description' }
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
                label: 'Departing - Recommended Route',
                symbol: commonSymbols.GREEN_ARROW
              }
            ]
          } as unknown as esri.UniqueValueRendererProperties
        } as unknown as FeatureNative
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  }
];

export const HsGraduationConfiguration: EventConfiguration = {
  id: 'hs-graduation-2026',
  name: 'High School Graduation',
  applicationName: 'High School Graduation Transportation Map',
  shortApplicationName: 'High School Graduation Map',
  introductionText: 'Get the best transportation and parking information for the high school graduation ceremonies.',
  eventDates: ['2026-05-22', '2026-05-23'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16,
  legendAllowVisibilityToggle: true
};

export const HsGraduationOptions: SpecialEventOptions = [];

export const HsGraduationTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: HsGraduationConfiguration,
  sources: HsGraduationColdLayerSources,
  options: HsGraduationOptions,
  references: HsGraduationLayerReferences,
  discover: {
    id: HsGraduationConfiguration.id,
    name: HsGraduationConfiguration.name,
    description: 'Transportation and parking information for high school graduation ceremonies.',
    source: 'internal',
    type: 'event',
    keywords: ['high school', 'graduation', 'parking', 'transportation']
  }
};
