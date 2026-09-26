import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SPIRIT_OF_150_WEEK_LAYERS {
  CAKE_ICE_CREAM = 'spirit-of-150-week-cake-ice-cream'
}

const eventUrl = Connections.spiritOf150WeekUrl;

/**
 * Picture-marker art from the service's published renderer, inlined because the hosted service's image
 * endpoint (`/0/images/<hash>`) returns 400, which would leave the markers and legend swatch blank.
 */
const CAKE_IMAGE_DATA =
  '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' +
  'AABJRU5ErkJggg==';

// The published symbol is a tall pin (32x40 px, 0.8 ratio) declared as a square 25x25 esriPMS, which
// stretches it on the map. Re-render it at a matching 0.8 ratio.
const CAKE_ICON_URL = `data:image/png;base64,${CAKE_IMAGE_DATA}`;

export const SpiritOf150WeekDefinitions = {
  CAKE_ICE_CREAM: {
    id: SPIRIT_OF_150_WEEK_LAYERS.CAKE_ICE_CREAM,
    layerId: SPIRIT_OF_150_WEEK_LAYERS.CAKE_ICE_CREAM,
    name: 'Cake & Ice Cream Locations',
    url: `${eventUrl}/0`
  }
};

export const SpiritOf150WeekLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SpiritOf150WeekDefinitions.CAKE_ICE_CREAM.id,
    title: SpiritOf150WeekDefinitions.CAKE_ICE_CREAM.name,
    url: SpiritOf150WeekDefinitions.CAKE_ICE_CREAM.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
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
        label: 'Cake & Ice Cream Locations',
        symbol: {
          type: 'picture-marker',
          url: CAKE_ICON_URL,
          width: 24,
          height: 30
        } as unknown as esri.SymbolProperties
      }
    }
  } as unknown as LayerSource
];

export const SpiritOf150WeekConfiguration: EventConfiguration = {
  id: 'spirit-of-150-week',
  name: 'Spirit of 150 Week',
  applicationName: 'Spirit of 150 Week Map',
  shortApplicationName: 'Spirit of 150 Week',
  eventDates: ['2026-10-05'],
  zoom: 15,
  mapCenter: [-96.34683, 30.61039]
};

export const SpiritOf150WeekOptions: SpecialEventOptions = [];

export const SpiritOf150WeekTs: AggiemapCustomMapConfiguration = {
  configuration: SpiritOf150WeekConfiguration,
  options: SpiritOf150WeekOptions,
  sources: SpiritOf150WeekLayerSources,
  references: SPIRIT_OF_150_WEEK_LAYERS,
  type: 'special-event',
  discover: {
    id: SpiritOf150WeekConfiguration.id,
    name: SpiritOf150WeekConfiguration.name,
    description: 'Cake and ice cream locations across campus for Spirit of 150 Week.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    keywords: ['spirit', '150', 'week', 'cake', 'ice cream', 'celebration']
  }
};
