import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SAVANNAH_BANANAS_PARKING_LAYERS {
  SHUTTLE_GROUP = 'savannah-bananas-shuttle-group',
  SHUTTLE_STOPS = 'savannah-bananas-shuttle-stops',
  SHUTTLE_ROUTES = 'savannah-bananas-shuttle-routes',
  PARKING_GROUP = 'savannah-bananas-parking-group',
  ACCESSIBLE_PREPAID_PARKING = 'savannah-bananas-accessible-prepaid-parking',
  EVENT_PARKING = 'savannah-bananas-event-parking'
}

const eventUrl = Connections.savannahBananasUrl;

export const SavannahBananasParkingDefinitions = {
  SHUTTLE_GROUP: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_GROUP,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_GROUP,
    name: 'Event Shuttles',
    url: `${eventUrl}/0`
  },
  SHUTTLE_STOPS: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_STOPS,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_STOPS,
    name: 'Campus Shuttle Stops',
    url: `${eventUrl}/1`
  },
  SHUTTLE_ROUTES: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_ROUTES,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_ROUTES,
    name: 'Shuttle Routes',
    url: `${eventUrl}/2`
  },
  PARKING_GROUP: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.PARKING_GROUP,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.PARKING_GROUP,
    name: 'Event Parking',
    url: `${eventUrl}/3`
  },
  ACCESSIBLE_PREPAID_PARKING: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    name: 'Accessible/Prepaid/AVP Parking',
    url: `${eventUrl}/4`
  },
  EVENT_PARKING: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.EVENT_PARKING,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.EVENT_PARKING,
    name: 'Event Lots',
    url: `${eventUrl}/5`
  }
};

const SavannahBananasLayerReferences: Record<string, string> = {
  PARKING_GROUP: SAVANNAH_BANANAS_PARKING_LAYERS.PARKING_GROUP,
  SHUTTLE_GROUP: SAVANNAH_BANANAS_PARKING_LAYERS.SHUTTLE_GROUP
};

export const SavannahBananasParkingColdLayerSources: LayerSource[] = [
  {
    type: 'group',
    id: SavannahBananasParkingDefinitions.PARKING_GROUP.id,
    title: SavannahBananasParkingDefinitions.PARKING_GROUP.name,
    visible: true,
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: SavannahBananasParkingDefinitions.EVENT_PARKING.id,
        title: SavannahBananasParkingDefinitions.EVENT_PARKING.name,
        url: SavannahBananasParkingDefinitions.EVENT_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: {
            field: 'name'
          },
          description: {
            field: 'description'
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
        id: SavannahBananasParkingDefinitions.ACCESSIBLE_PREPAID_PARKING.id,
        title: SavannahBananasParkingDefinitions.ACCESSIBLE_PREPAID_PARKING.name,
        url: SavannahBananasParkingDefinitions.ACCESSIBLE_PREPAID_PARKING.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: {
            field: 'name'
          },
          description: {
            field: 'description'
          }
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
    id: SavannahBananasParkingDefinitions.SHUTTLE_GROUP.id,
    title: SavannahBananasParkingDefinitions.SHUTTLE_GROUP.name,
    visible: true,
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: SavannahBananasParkingDefinitions.SHUTTLE_ROUTES.id,
        title: SavannahBananasParkingDefinitions.SHUTTLE_ROUTES.name,
        url: SavannahBananasParkingDefinitions.SHUTTLE_ROUTES.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupData: {
          name: {
            field: 'name'
          },
          description: {
            field: 'description'
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
        id: SavannahBananasParkingDefinitions.SHUTTLE_STOPS.id,
        title: SavannahBananasParkingDefinitions.SHUTTLE_STOPS.name,
        url: SavannahBananasParkingDefinitions.SHUTTLE_STOPS.url,
        popupComponent: MarkdownWDirectionsPopupComponent,
        popupDataResolutionStrategy: 'cumulative',
        popupData: {
          name: {
            field: 'StopName'
          },
          routeName: {
            field: 'RouteName'
          },
          route: {
            field: 'Route'
          },
          stopNumber: {
            field: 'StopNum'
          },
          description: '<strong>{attributes.routeName}</strong><br>Route {attributes.route}<br>Stop {attributes.stopNumber}'
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
  }
];

export const SavannahBananasParkingConfiguration: EventConfiguration = {
  id: 'savannah-bananas-parking',
  name: 'Banana Ball',
  applicationName: 'Banana Ball Transportation Map',
  shortApplicationName: 'Banana Ball Map',
  introductionText: 'Parking and transportation info for Savannah Bananas vs Texas Tailgaters at Kyle Field.',
  eventDates: ['2026-05-02'],
  scheduleUrl: 'https://app.12thman.com/bananaball',
  mapCenter: [-96.34046, 30.60798],
  zoom: 16,
  legendAllowVisibilityToggle: true,
  legendCombineChildrenUnderPrimary: true
};

export const SavannahBananasParkingOptions: SpecialEventOptions = [];

export const SavannahBananasParkingTs: AggiemapCustomMapConfiguration = {
  configuration: SavannahBananasParkingConfiguration,
  options: SavannahBananasParkingOptions,
  sources: SavannahBananasParkingColdLayerSources,
  references: SavannahBananasLayerReferences,
  type: 'special-event',
  discover: {
    id: SavannahBananasParkingConfiguration.id,
    name: SavannahBananasParkingConfiguration.name,
    description: 'Transportation and parking information for Savannah Bananas vs Texas Tailgaters at Kyle Field.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['savannah bananas', 'texas tailgaters', 'kyle field', 'parking', 'transportation']
  }
};
