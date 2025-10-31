import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MENS_BASKETBALL_LAYERS {
  PARKING_LOTS = 'mens-basketball-parking-lots',
  ROUTE = 'mens-basketball-route'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BaseMBasketTennisXCountry/MapServer/9';

export const MensBasketball_Definitions = {
  PARKING: {
    id: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    layerId: MENS_BASKETBALL_LAYERS.PARKING_LOTS,
    name: 'Men\'s Basketball Parking',
    url: `${eventUrl}/0`
  },
  ROUTE: {
    id: MENS_BASKETBALL_LAYERS.ROUTE,
    layerId: MENS_BASKETBALL_LAYERS.ROUTE,
    name: 'Men\'s Basketball Parking Map',
    url: `${eventUrl}/1`
  }
};

export const MensBasketball_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MensBasketball_Definitions.PARKING.id,
    title: MensBasketball_Definitions.PARKING.name,
    url: MensBasketball_Definitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: MensBasketball_Definitions.ROUTE.id,
    title: MensBasketball_Definitions.ROUTE.name,
    url: MensBasketball_Definitions.ROUTE.url,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'rgb(56, 168, 0)',
          width: 2.5,
          style: 'solid',
          marker: {
            style: 'arrow',
            color: 'rgb(56, 168, 0)',
            placement: 'end'
          }
        }
      }
    }
  }
];

export const MensBasketball_Configuration: EventConfiguration = {
  id: 'mens-basketball',
  name: 'Men\'s Basketball Parking',
  applicationName: 'Men\'s Basketball Parking Map',
  shortApplicationName: 'Men\'s Basketball Parking Map',
  eventDates: ['2025-04-27'],
  zoom: 16,
  mapCenter: [-96.3434, 30.61017]
};

export const MensBasketball_Options: SpecialEventOptions = [];

export const MensBasketball_Ts: ISpecialEventRoot = {
  configuration: MensBasketball_Configuration,
  options: MensBasketball_Options,
  sources: MensBasketball_ColdLayerSources,
  references: MENS_BASKETBALL_LAYERS,
  discover: {
    id: MensBasketball_Configuration.id,
    name: MensBasketball_Configuration.name,
    description: 'Transportation and parking information for Men\'s Basketball events.',
    source: 'internal',
    type: 'event',
    keywords: ['bike', 'mens-basketball', 'cycling', 'parking', 'transportation']
  }
};
