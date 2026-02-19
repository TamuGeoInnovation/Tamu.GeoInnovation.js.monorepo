import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MAROON_WHITE_GAME_LAYERS {
  PARKING_LOTS = 'maroon-white-game-parking-lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Maroon_White_Game/MapServer';

export const MaroonWhiteGameDefinitions = {
  PARKING_LOTS: {
    id: MAROON_WHITE_GAME_LAYERS.PARKING_LOTS,
    layerId: MAROON_WHITE_GAME_LAYERS.PARKING_LOTS,
    name: 'Maroon & White Game Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const MaroonWhiteGameColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaroonWhiteGameDefinitions.PARKING_LOTS.id,
    title: MaroonWhiteGameDefinitions.PARKING_LOTS.name,
    url: MaroonWhiteGameDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: '{attributes.description}\n{attributes.Notes}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const MaroonWhiteGameConfiguration: EventConfiguration = {
  id: 'maroon-white-game-2026',
  name: 'Maroon & White Game',
  applicationName: 'Maroon & White Game Transportation Map',
  shortApplicationName: 'Maroon & White Game Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2026-04-19'],
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
    keywords: ['maroon', 'white', 'game', 'parking', 'transportation']
  }
};
