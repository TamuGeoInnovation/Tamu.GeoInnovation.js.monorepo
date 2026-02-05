import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum MUSTER_LAYERS {
  AREAS = 'muster-parking',
  TRAFFIC_FLOW = 'muster-bus-routes'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Muster/MapServer';

export const MusterEventDefinitions = {
  EVENT_AREAS: {
    id: MUSTER_LAYERS.AREAS,
    layerId: MUSTER_LAYERS.AREAS,
    name: 'Muster Event Parking',
    url: `${eventUrl}/0`
  },
  TRAFFIC_FLOW: {
    id: MUSTER_LAYERS.TRAFFIC_FLOW,
    layerId: MUSTER_LAYERS.TRAFFIC_FLOW,
    name: 'Traffic Flow',
    url: `${eventUrl}/1`
  }
};

export const MusterEventColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MusterEventDefinitions.EVENT_AREAS.id,
    title: MusterEventDefinitions.EVENT_AREAS.name,
    url: MusterEventDefinitions.EVENT_AREAS.url,
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
    id: MusterEventDefinitions.TRAFFIC_FLOW.id,
    title: MusterEventDefinitions.TRAFFIC_FLOW.name,
    url: MusterEventDefinitions.TRAFFIC_FLOW.url,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'edited',
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
  }
];

export const MusterConfiguration: EventConfiguration = {
  id: 'muster',
  name: 'Muster',
  applicationName: 'Muster Parking Map',
  shortApplicationName: 'Muster Map',
  eventDates: ['2026-04-21'],
  zoom: 16
};

export const MusterOptions: SpecialEventOptions = [];

export const MusterTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: MusterConfiguration,
  options: MusterOptions,
  sources: MusterEventColdLayerSources,
  references: MUSTER_LAYERS,
  discover: {
    id: MusterConfiguration.id,
    name: MusterConfiguration.name,
    description: 'Transportation and parking information for Muster.',
    source: 'internal',
    type: 'event',
    keywords: ['muster', 'parking', 'transportation']
  }
};
