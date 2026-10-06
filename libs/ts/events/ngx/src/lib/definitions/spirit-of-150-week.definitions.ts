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
      outFields: ['*']
    }
  } as unknown as LayerSource
];

export const SpiritOf150WeekConfiguration: EventConfiguration = {
  id: 'spirit-of-150-week',
  name: '150 Cake & Ice Cream',
  applicationName: '150 Cake & Ice Cream Map',
  shortApplicationName: '150 Cake & Ice Cream',
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
    description: 'Cake and ice cream locations across campus on 5 October.',
    source: 'internal',
    type: 'event',
    // Listed on Campus Events and on the 150th Anniversary page. Both, not either:
    // these are campus events that also belong to the anniversary set.
    mapTypes: ['campus', '150'],
    columnKey: 'fall',
    // 'spirit' and 'week' are kept deliberately: the event was announced under the old name,
    // so anyone searching for it that way should still find it (#1142).
    keywords: ['cake', 'ice cream', '150', 'spirit', 'week', 'celebration']
  }
};
