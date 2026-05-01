import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MOTORIST_ASSISTANCE_LAYERS {
  SERVICE_AREA = 'Service Area'
}

const eventUrl = Connections('gis.tamu.edu').motoristAssistanceUrl;

export const MotoristAssistanceDefinitions = {
  SERVICE_AREA: {
    id: MOTORIST_ASSISTANCE_LAYERS.SERVICE_AREA,
    layerId: MOTORIST_ASSISTANCE_LAYERS.SERVICE_AREA,
    name: 'Service Area',
    url: `${eventUrl}/0`
  }
};

export const MotoristAssistanceColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MotoristAssistanceDefinitions.SERVICE_AREA.id,
    title: MotoristAssistanceDefinitions.SERVICE_AREA.name,
    url: MotoristAssistanceDefinitions.SERVICE_AREA.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const MotoristAssistanceConfiguration: EventConfiguration = {
  id: 'motorist-assistance',
  name: 'Motorist Assistance',
  applicationName: 'Motorist Assistance Map',
  shortApplicationName: 'Motorist Assistance',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const MotoristAssistanceOptions: SpecialEventOptions = [];

export const MotoristAssistanceTs: AggiemapCustomMapConfiguration = {
  configuration: MotoristAssistanceConfiguration,
  options: MotoristAssistanceOptions,
  sources: MotoristAssistanceColdLayerSources,
  references: MOTORIST_ASSISTANCE_LAYERS,
  type: 'general-map',
  discover: {
    id: MotoristAssistanceConfiguration.id,
    name: MotoristAssistanceConfiguration.name,
    description: 'Motorist assistance service area coverage.',
    source: 'internal',
    type: 'parking',
    keywords: ['motorist', 'assistance', 'service area']
  }
};
