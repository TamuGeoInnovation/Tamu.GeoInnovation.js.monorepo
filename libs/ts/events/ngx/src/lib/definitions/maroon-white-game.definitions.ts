import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum MAROON_WHITE_GAME_LAYERS {
  ACCESSIBLE_PREPAID_PARKING = 'maroon-white-game-accessible-prepaid-parking',
  EVENT_PARKING_LOTS = 'maroon-white-game-event-parking-lots'
}

const eventUrl = Connections.maroonWhiteGameUrl;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

export const MaroonWhiteGameDefinitions = {
  ACCESSIBLE_PREPAID_PARKING: {
    id: MAROON_WHITE_GAME_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    layerId: MAROON_WHITE_GAME_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    name: 'Accessible/PrePaid Parking',
    url: `${eventUrl}/0`
  },
  EVENT_PARKING_LOTS: {
    id: MAROON_WHITE_GAME_LAYERS.EVENT_PARKING_LOTS,
    layerId: MAROON_WHITE_GAME_LAYERS.EVENT_PARKING_LOTS,
    name: 'Event Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const MaroonWhiteGameColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.id,
    title: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.name,
    url: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    // Service-backed fallback if we want this layer to pull its map symbology and legend entries
    // directly from the ArcGIS service again, like the simpler event map definitions:
    // native: {
    //   outFields: ['*']
    // }
    native: {
      outFields: ['*']
} as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.id,
    title: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.name,
    url: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    // Service-backed fallback if we want this layer to pull its map symbology and legend entries
    // directly from the ArcGIS service again, like the simpler event map definitions:
    // native: {
    //   outFields: ['*']
    // }
    native: {
      outFields: ['*']
} as unknown as FeatureNative
  }
];

export const MaroonWhiteGameConfiguration: EventConfiguration = {
  id: 'maroon-white-game-2026',
  name: 'Maroon & White Game',
  applicationName: 'Maroon & White Game Transportation',
  shortApplicationName: 'Maroon & White Game',
  introductionText: 'Get the best parking information for',
  eventDates: ['2026-04-18'],
  scheduleUrl: 'https://12thman.com/sports/football/schedule',
  mapCenter: [-96.34046, 30.60798],
  zoom: 16
};

export const MaroonWhiteGameOptions: SpecialEventOptions = [];

export const MaroonWhiteTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: MaroonWhiteGameConfiguration,
  options: MaroonWhiteGameOptions,
  sources: MaroonWhiteGameColdLayerSources,
  references: MAROON_WHITE_GAME_LAYERS,
  discover: {
    id: MaroonWhiteGameConfiguration.id,
    name: MaroonWhiteGameConfiguration.name,
    description: 'Transportation and parking information for the Maroon & White Game.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['maroon', 'white', 'game', 'parking', 'transportation']
  }
};
