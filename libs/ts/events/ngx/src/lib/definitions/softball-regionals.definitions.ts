import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SOFTBALL_LAYERS {
  SOFTBALL_ROUTES = 'softball-routes',
  SOFTBALL_LOCATIONS = 'softball-locations'
}

const eventUrl = Connections('gis.it.tamu.edu').softballRegionalsUrl;

const SoftballEventDefinitions = {
  SOFTBALL_ROUTES: {
    id: SOFTBALL_LAYERS.SOFTBALL_ROUTES,
    layerId: SOFTBALL_LAYERS.SOFTBALL_ROUTES,
    name: 'Softball Routes',
    url: `${eventUrl}/0`
  },
  SOFTBALL_LOCATIONS: {
    id: SOFTBALL_LAYERS.SOFTBALL_LOCATIONS,
    layerId: SOFTBALL_LAYERS.SOFTBALL_LOCATIONS,
    name: 'Softball Locations',
    url: `${eventUrl}/1`
  }
};

export const SoftballLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SoftballEventDefinitions.SOFTBALL_ROUTES.id,
    title: SoftballEventDefinitions.SOFTBALL_ROUTES.name,
    url: SoftballEventDefinitions.SOFTBALL_ROUTES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'name',
        uniqueValueInfos: [
          {
            value: 'Fast Route',
            label: 'Fast Route',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 2,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Expect Delays',
            label: 'Expect Delays',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2,
              marker: {
                style: 'arrow',
                color: 'rgb(230, 0, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: SoftballEventDefinitions.SOFTBALL_LOCATIONS.id,
    title: SoftballEventDefinitions.SOFTBALL_LOCATIONS.name,
    url: SoftballEventDefinitions.SOFTBALL_LOCATIONS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const SoftballConfiguration: EventConfiguration = {
  id: 'softball-regionals-2025',
  name: 'Softball Regionals Map',
  applicationName: 'Softball Regionals Event Map',
  shortApplicationName: 'Softball Regionals Map',
  introductionText: 'Get the best transportation and parking information for Softball Regionals.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/softball/schedule',
  mapCenter: [-96.34454, 30.60338],
  zoom: 17
};

export const SoftballOptions: SpecialEventOptions = [];

export const SoftballRegionalsTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: SoftballConfiguration,
  sources: SoftballLayerSources,
  options: SoftballOptions,
  references: SOFTBALL_LAYERS,
  discover: {
    id: SoftballConfiguration.id,
    name: SoftballConfiguration.name,
    description: 'Transportation and parking information for Softball Regionals.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['softball', 'regionals', 'parking', 'transportation']
  }
};
