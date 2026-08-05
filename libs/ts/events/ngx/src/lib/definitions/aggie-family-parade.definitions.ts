import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum AGGIE_FAMILY_PARADE_LAYERS {
  POIS = 'aggie-family-parade-pois',
  ROUTE = 'aggie-family-parade-route'
}

const eventUrl = Connections.aggieFamilyParadeUrl;

// The published POI symbol is a tall pin (32x40 px, 0.8 ratio) but the service declares it as a
// square 25x25 esriPMS, which stretches it on the map. Re-render it as a picture-marker pointing at
// the same service image with proportional dimensions to preserve the aspect ratio.
const POI_ICON_URL = `${eventUrl}/0/images/5e7ab8387a04631ca389056a948967eb`;

export const AggieFamilyParadeDefinitions = {
  POIS: {
    id: AGGIE_FAMILY_PARADE_LAYERS.POIS,
    layerId: AGGIE_FAMILY_PARADE_LAYERS.POIS,
    name: 'Points of Interest',
    url: `${eventUrl}/0`
  },
  ROUTE: {
    id: AGGIE_FAMILY_PARADE_LAYERS.ROUTE,
    layerId: AGGIE_FAMILY_PARADE_LAYERS.ROUTE,
    name: 'Parade Route',
    url: `${eventUrl}/1`
  }
};

export const AggieFamilyParadeLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AggieFamilyParadeDefinitions.POIS.id,
    title: AggieFamilyParadeDefinitions.POIS.name,
    url: AggieFamilyParadeDefinitions.POIS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: POI_ICON_URL,
          width: 24,
          height: 30
        } as unknown as esri.SymbolProperties
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: AggieFamilyParadeDefinitions.ROUTE.id,
    title: AggieFamilyParadeDefinitions.ROUTE.name,
    url: AggieFamilyParadeDefinitions.ROUTE.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'rgb(0, 115, 76)',
          width: 2,
          style: 'solid',
          marker: {
            style: 'arrow',
            color: 'rgb(0, 115, 76)',
            placement: 'end'
          }
        }
      }
    }
  }
];

export const AggieFamilyParadeConfiguration: EventConfiguration = {
  id: 'aggie-family-parade',
  name: 'Aggie Family Parade',
  applicationName: 'Aggie Family Parade Map',
  shortApplicationName: 'Aggie Family Parade',
  eventDates: ['2027-04-10'],
  zoom: 15,
  mapCenter: [-96.33557, 30.61546]
};

export const AggieFamilyParadeOptions: SpecialEventOptions = [];

export const AggieFamilyParadeTs: AggiemapCustomMapConfiguration = {
  configuration: AggieFamilyParadeConfiguration,
  options: AggieFamilyParadeOptions,
  sources: AggieFamilyParadeLayerSources,
  references: AGGIE_FAMILY_PARADE_LAYERS,
  type: 'special-event',
  discover: {
    id: AggieFamilyParadeConfiguration.id,
    name: AggieFamilyParadeConfiguration.name,
    description: 'Parade route and points of interest for the Aggie Family Parade.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['aggie', 'family', 'parade', 'route', '150']
  }
};
