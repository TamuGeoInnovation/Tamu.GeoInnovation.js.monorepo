import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum TROUBADOUR_LAYERS {
  PARKING = 'troubadour-parking'
}

const eventUrl = Connections.troubadourFestivalUrl;

const TroubadourFestivalEventDefinitions = {
  TROUBADOUR_PARKING: {
    id: TROUBADOUR_LAYERS.PARKING,
    layerId: TROUBADOUR_LAYERS.PARKING,
    name: 'Troubadour Festival Parking',
    url: `${eventUrl}/0`
  }
};

export const TroubadourColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TroubadourFestivalEventDefinitions.TROUBADOUR_PARKING.id,
    title: TroubadourFestivalEventDefinitions.TROUBADOUR_PARKING.name,
    url: TroubadourFestivalEventDefinitions.TROUBADOUR_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const TroubadourConfiguration: EventConfiguration = {
  id: 'troubadour-festival-2025',
  name: 'Troubadour Festival',
  applicationName: 'Troubadour Festival Parking Map',
  shortApplicationName: 'Troubadour Festival Map',
  introductionText: 'Get the best transportation and parking information for Troubadour Festival.',
  eventDates: ['2025-05-17'],
  mapCenter: [-96.33636, 30.6101],
  zoom: 16
};

export const TroubadourOptions: SpecialEventOptions = [];

export const TroubadourTs: AggiemapCustomMapConfiguration = {
  configuration: TroubadourConfiguration,
  options: TroubadourOptions,
  sources: TroubadourColdLayerSources,
  references: TROUBADOUR_LAYERS,
  type: 'special-event',
  discover: {
    id: TroubadourConfiguration.id,
    name: TroubadourConfiguration.name,
    description: 'Transportation and parking information for Troubadour Festival.',
    source: 'internal',
    visible: false,
    type: 'event',
    columnKey: 'spring',
    keywords: ['troubadour', 'festival', 'parking', 'transportation']
  }
};
