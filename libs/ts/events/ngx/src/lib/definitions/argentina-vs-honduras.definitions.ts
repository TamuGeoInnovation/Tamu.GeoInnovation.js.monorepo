import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum ARGENTINA_VS_HONDURAS_LAYERS {
  EVENT_SHUTTLES_GROUP = 'argentina-vs-honduras-event-shuttles-group',
  CAMPUS_SHUTTLE_STOPS = 'argentina-vs-honduras-campus-shuttle-stops',
  SHUTTLE_ROUTES = 'argentina-vs-honduras-shuttle-routes',
  EVENT_PARKING_GROUP = 'argentina-vs-honduras-event-parking-group',
  PARKING_AND_RIDESHARE = 'argentina-vs-honduras-parking-and-rideshare',
  EVENT_PARKING = 'argentina-vs-honduras-event-parking'
}

const eventUrl = Connections.argentinaVsHondurasUrl;

const ArgentinaVsHondurasEventDefinitions = {
  EVENT_SHUTTLES_GROUP: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.EVENT_SHUTTLES_GROUP,
    name: 'Event Shuttles',
    url: `${eventUrl}/0`
  },
  CAMPUS_SHUTTLE_STOPS: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.CAMPUS_SHUTTLE_STOPS,
    name: 'Campus Shuttle Stops',
    url: `${eventUrl}/1`
  },
  SHUTTLE_ROUTES: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.SHUTTLE_ROUTES,
    name: 'Shuttle Routes',
    url: `${eventUrl}/2`
  },
  EVENT_PARKING_GROUP: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.EVENT_PARKING_GROUP,
    name: 'Event Parking',
    url: `${eventUrl}/3`
  },
  PARKING_AND_RIDESHARE: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.PARKING_AND_RIDESHARE,
    name: 'Parking & Rideshare',
    url: `${eventUrl}/4`
  },
  EVENT_PARKING: {
    id: ARGENTINA_VS_HONDURAS_LAYERS.EVENT_PARKING,
    name: 'Event Parking',
    url: `${eventUrl}/5`
  }
};

const ArgentinaVsHondurasLayerReferences: Record<string, string> = {
  EVENT_SHUTTLES_GROUP: ARGENTINA_VS_HONDURAS_LAYERS.EVENT_SHUTTLES_GROUP,
  EVENT_PARKING_GROUP: ARGENTINA_VS_HONDURAS_LAYERS.EVENT_PARKING_GROUP
};

export const ArgentinaVsHondurasColdLayerSources: LayerSource[] = [
  {
    type: 'group',
    id: ArgentinaVsHondurasEventDefinitions.EVENT_SHUTTLES_GROUP.id,
    title: ArgentinaVsHondurasEventDefinitions.EVENT_SHUTTLES_GROUP.name,
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    sources: [
      {
        type: 'feature',
        id: ArgentinaVsHondurasEventDefinitions.SHUTTLE_ROUTES.id,
        title: ArgentinaVsHondurasEventDefinitions.SHUTTLE_ROUTES.name,
        url: ArgentinaVsHondurasEventDefinitions.SHUTTLE_ROUTES.url,
        popupComponent: MarkdownPopupComponent,
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
        id: ArgentinaVsHondurasEventDefinitions.CAMPUS_SHUTTLE_STOPS.id,
        title: ArgentinaVsHondurasEventDefinitions.CAMPUS_SHUTTLE_STOPS.name,
        url: ArgentinaVsHondurasEventDefinitions.CAMPUS_SHUTTLE_STOPS.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        },
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  },
  {
    type: 'group',
    id: ArgentinaVsHondurasEventDefinitions.EVENT_PARKING_GROUP.id,
    title: ArgentinaVsHondurasEventDefinitions.EVENT_PARKING_GROUP.name,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    sources: [
      {
        type: 'feature',
        id: ArgentinaVsHondurasEventDefinitions.EVENT_PARKING.id,
        title: ArgentinaVsHondurasEventDefinitions.EVENT_PARKING.name,
        url: ArgentinaVsHondurasEventDefinitions.EVENT_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        },
        legend: {
          mode: 'renderer-symbol',
          preserveAspectRatio: true,
          fit: 'contain',
          width: 24,
          height: 30
        }
      },
      {
        type: 'feature',
        id: ArgentinaVsHondurasEventDefinitions.PARKING_AND_RIDESHARE.id,
        title: ArgentinaVsHondurasEventDefinitions.PARKING_AND_RIDESHARE.name,
        url: ArgentinaVsHondurasEventDefinitions.PARKING_AND_RIDESHARE.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: { field: 'name' },
          description: { field: 'description' }
        },
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        },
        legend: {
          mode: 'renderer-symbol',
          preserveAspectRatio: true,
          fit: 'contain',
          width: 26,
          height: 32
        }
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  }
];

export const ArgentinaVsHondurasConfiguration: EventConfiguration = {
  id: 'argentina-vs-honduras-2026',
  name: 'Road to 26: Argentina vs. Honduras',
  applicationName: 'Road to 26: Argentina vs. Honduras Transportation Map',
  shortApplicationName: 'Road to 26: Argentina vs. Honduras Map',
  introductionText: 'Get the best transportation and parking information for the Road to 26: Argentina vs. Honduras soccer match.',
  eventDates: ['2026-06-06'],
  mapCenter: [-96.34454, 30.60338],
  zoom: 16,
  legendAllowVisibilityToggle: true,
  legendCombineChildrenUnderPrimary: true
};

export const ArgentinaVsHondurasOptions: SpecialEventOptions = [];

export const ArgentinaVsHondurasTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: ArgentinaVsHondurasConfiguration,
  sources: ArgentinaVsHondurasColdLayerSources,
  options: ArgentinaVsHondurasOptions,
  references: ArgentinaVsHondurasLayerReferences,
  discover: {
    id: ArgentinaVsHondurasConfiguration.id,
    name: ArgentinaVsHondurasConfiguration.name,
    description: 'Transportation and parking information for the Road to 26: Argentina vs. Honduras soccer match.',
    source: 'internal',
    type: 'event',
    keywords: ['road to 26', 'argentina', 'honduras', 'soccer', 'parking', 'shuttle', 'transportation']
  }
};
