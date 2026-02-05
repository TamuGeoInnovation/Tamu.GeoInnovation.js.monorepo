import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FOUR_H_ROUNDUP_LAYERS {
  FOUR_H_ROUNDUP_PARKING = 'four-h-roundup-parking',
  FOUR_H_ROUNDUP_LOCATIONS = 'four-h-roundup-locations'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/4H_Roundup/MapServer';

const FourHRoundupEventDefinitions = {
  FOUR_H_PARKING: {
    id: FOUR_H_ROUNDUP_LAYERS.FOUR_H_ROUNDUP_PARKING,
    layerId: FOUR_H_ROUNDUP_LAYERS.FOUR_H_ROUNDUP_PARKING,
    name: '4-H Roundup Parking',
    url: `${eventUrl}/0`
  },
  FOUR_H_LOCATIONS: {
    id: FOUR_H_ROUNDUP_LAYERS.FOUR_H_ROUNDUP_LOCATIONS,
    layerId: FOUR_H_ROUNDUP_LAYERS.FOUR_H_ROUNDUP_LOCATIONS,
    name: '4-H Roundup Locations',
    url: `${eventUrl}/0`
  }
};

export const FourHColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FourHRoundupEventDefinitions.FOUR_H_PARKING.id,
    title: FourHRoundupEventDefinitions.FOUR_H_PARKING.name,
    url: FourHRoundupEventDefinitions.FOUR_H_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Type = 'Event Parking'"
    }
  },
  {
    type: 'feature',
    id: FourHRoundupEventDefinitions.FOUR_H_LOCATIONS.id,
    title: FourHRoundupEventDefinitions.FOUR_H_LOCATIONS.name,
    url: FourHRoundupEventDefinitions.FOUR_H_LOCATIONS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: "Type = 'Event Location'"
    }
  }
];

export const FourHRoundupConfiguration: EventConfiguration = {
  id: '4h-roundup-2025',
  name: '4-H Roundup',
  applicationName: '4-H Roundup Event Map',
  shortApplicationName: '4-H Roundup Map',
  introductionText: 'Get the best transportation and parking information for the 4-H Roundup event.',
  eventDates: ['2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

export const FourHRoundupOptions: SpecialEventOptions = [];

export const FourHRoundupTs: AggiemapCustomMapConfiguration = {
  configuration: FourHRoundupConfiguration,
  options: FourHRoundupOptions,
  sources: FourHColdLayerSources,
  references: FOUR_H_ROUNDUP_LAYERS,
  type: 'special-event',
  discover: {
    id: FourHRoundupConfiguration.id,
    name: FourHRoundupConfiguration.name,
    description: 'Transportation and parking information for 4-H Roundup.',
    source: 'internal',
    type: 'event',
    keywords: ['4h', 'roundup', 'parking', 'transportation']
  }
};
