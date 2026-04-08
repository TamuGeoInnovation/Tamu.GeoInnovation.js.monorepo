import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { commonSymbols } from './common.definitions';

import esri = __esri;

export enum MUSTER_LAYERS {
  PARKING = 'muster-parking',
  TRAFFIC_FLOW = 'muster-traffic-flow',
  ACCESSIBLE_PARKING = 'muster-accessible-parking'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/Muster/MapServer';
const accessibleParkingIconUrl = eventUrl + '/1/images/956c1de4ae59fdb677e36c1631af01e3';

export const MusterEventDefinitions = {
  TRAFFIC_FLOW: {
    id: MUSTER_LAYERS.TRAFFIC_FLOW,
    layerId: MUSTER_LAYERS.TRAFFIC_FLOW,
    name: 'Muster Traffic Flow',
    url: eventUrl + '/0'
  },
  ACCESSIBLE_PARKING: {
    id: MUSTER_LAYERS.ACCESSIBLE_PARKING,
    layerId: MUSTER_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking',
    url: eventUrl + '/1'
  },
  PARKING: {
    id: MUSTER_LAYERS.PARKING,
    layerId: MUSTER_LAYERS.PARKING,
    name: 'Muster Parking',
    url: eventUrl + '/2'
  }
};

export const MusterEventColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MusterEventDefinitions.TRAFFIC_FLOW.id,
    title: MusterEventDefinitions.TRAFFIC_FLOW.name,
    url: MusterEventDefinitions.TRAFFIC_FLOW.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.edited'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 11,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'edited',
        uniqueValueInfos: [
          {
            value: 'Fast Route',
            label: 'Recommended Routes',
            symbol: {
              ...commonSymbols.GREEN_ARROW,
              width: 3
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Expect Delays',
            label: 'Expect Delays',
            symbol: commonSymbols.RED_ARROW as unknown as esri.SimpleLineSymbolProperties
          }
        ]
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: MusterEventDefinitions.ACCESSIBLE_PARKING.id,
    title: MusterEventDefinitions.ACCESSIBLE_PARKING.name,
    url: MusterEventDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 12,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        label: MusterEventDefinitions.ACCESSIBLE_PARKING.name,
        symbol: {
          type: 'picture-marker',
          url: accessibleParkingIconUrl,
          // Image is 700x885 px (portrait). Use proportional dimensions to avoid stretching.
          width: 22,
          height: 28
        } as unknown as esri.SymbolProperties
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: MusterEventDefinitions.PARKING.id,
    title: MusterEventDefinitions.PARKING.name,
    url: MusterEventDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 10,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          {
            value: 'Open Parking',
            label: 'Free Event Parking',
            symbol: {
              type: 'simple-fill',
              color: [95, 138, 232, 255],
              outline: {
                type: 'simple-line',
                color: [94, 52, 234, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'Pay-By-Hour',
            label: 'Paid Hourly Parking',
            symbol: {
              type: 'simple-fill',
              color: [81, 179, 54, 255],
              outline: {
                type: 'simple-line',
                color: [68, 137, 112, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'Reserved - Accessible',
            label: 'Reserved',
            symbol: {
              type: 'simple-fill',
              color: [242, 160, 97, 255],
              outline: {
                type: 'simple-line',
                color: [230, 124, 0, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'Reserved',
            label: 'Reserved',
            symbol: {
              type: 'simple-fill',
              color: [242, 160, 97, 255],
              outline: {
                type: 'simple-line',
                color: [230, 124, 0, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'Closure',
            label: 'Road Closed (Pedestrian Zone)',
            symbol: {
              type: 'simple-fill',
              style: 'backward-diagonal',
              color: [230, 0, 0, 255],
              outline: {
                type: 'simple-line',
                color: [230, 0, 0, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          }
        ]
      }
    }
  } as unknown as LayerSource
];

export const MusterConfiguration: EventConfiguration = {
  id: 'muster',
  name: 'Muster',
  applicationName: 'Muster Parking Map',
  shortApplicationName: 'Muster Map',
  eventDates: ['2026-04-21'],
  mapCenter: [-96.34724, 30.6055],
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
