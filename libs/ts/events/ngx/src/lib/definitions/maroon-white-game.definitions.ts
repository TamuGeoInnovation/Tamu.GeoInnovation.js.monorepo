import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';
import { MAROON_WHITE_GAME_LAYERS } from '../interfaces/maroon-white-game.interface';

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
  id: 'maroon-white-game-2025',
  name: 'Maroon & White Game',
  applicationName: 'Maroon & White Game Transportation Map',
  shortApplicationName: 'Maroon & White Game Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2025-04-20'],
  mapCenter: [-96.3405, 30.61114],
  zoom: 16
};

export const MaroonWhiteGameOptions: SpecialEventOptions = [];
