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
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: AggieFamilyParadeDefinitions.ROUTE.id,
    url: AggieFamilyParadeDefinitions.ROUTE.url,
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
    // Listed on Campus Events and on the 150th Anniversary page. Both, not either:
    // these are campus events that also belong to the anniversary set.
    mapTypes: ['campus', '150'],
    columnKey: 'spring',
    keywords: ['aggie', 'family', 'parade', 'route', '150']
  }
};
