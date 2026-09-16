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

/**
 * Picture-marker art from the service's published renderer, inlined because the hosted view's image
 * endpoint (`/0/images/<hash>`) returns 400, which left the markers and legend swatches blank.
 */
const POI_IMAGE_DATA =
  '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';

// The published POI symbol is a tall pin (32x40 px, 0.8 ratio) but the service declares it as a
// square 25x25 esriPMS, which stretches it on the map. Re-render it at a matching 0.8 ratio to
// preserve the aspect ratio.
const POI_ICON_URL = `data:image/png;base64,${POI_IMAGE_DATA}`;

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
    // Match the on-map fix in the legend: pull the (now correctly proportioned) icon from the
    // renderer instead of the service's broken image URL, and render the swatch at the same ratio.
    legend: {
      mode: 'renderer-symbol',
      preserveAspectRatio: true,
      fit: 'contain',
      width: 24,
      height: 30
    },
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
