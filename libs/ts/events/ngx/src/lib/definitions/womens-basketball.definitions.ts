import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum WOMENS_BASKETBALL_LAYERS {
  PARKING_LOTS = 'womens-basketball-parking-lots',
  ROUTE = 'womens-basketball-route'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/TracSocSoftSwimVollWbask/MapServer/12';

export const WomensBasketball_Definitions = {
  PARKING: {
    id: WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
    layerId: WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
    name: 'Women\'s Basketball Parking',
    url: `${eventUrl}/0`
  },
  ROUTE: {
    id: WOMENS_BASKETBALL_LAYERS.ROUTE,
    layerId: WOMENS_BASKETBALL_LAYERS.ROUTE,
    name: 'Women\'s Basketball Parking Map',
    url: `${eventUrl}/1`
  }
};

export const WomensBasketball_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: WomensBasketball_Definitions.PARKING.id,
    title: WomensBasketball_Definitions.PARKING.name,
    url: WomensBasketball_Definitions.PARKING.url,
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
    id: WomensBasketball_Definitions.ROUTE.id,
    title: WomensBasketball_Definitions.ROUTE.name,
    url: WomensBasketball_Definitions.ROUTE.url,
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

export const WomensBasketball_Configuration: EventConfiguration = {
  id: 'womens-basketball',
  name: 'Women\'s Basketball Parking',
  applicationName: 'Women\'s Basketball Parking Map',
  shortApplicationName: 'Women\'s Basketball Parking Map',
  eventDates: ['2025-04-27'],
  zoom: 16,
  mapCenter: [-96.3434, 30.61017]
};

export const WomensBasketball_Options: SpecialEventOptions = [];

export const WomensBasketball_Ts: ISpecialEventRoot = {
  configuration: WomensBasketball_Configuration,
  options: WomensBasketball_Options,
  sources: WomensBasketball_ColdLayerSources,
  references: WOMENS_BASKETBALL_LAYERS,
  discover: {
    id: WomensBasketball_Configuration.id,
    name: WomensBasketball_Configuration.name,
    description: 'Transportation and parking information for Women\'s Basketball events.',
    source: 'internal',
    type: 'event',
    keywords: ['bike', 'womens-basketball', 'cycling', 'parking', 'transportation']
  }
};
