import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum MUSTER_LAYERS {
  PARKING = 'muster-parking',
  TRAFFIC_FLOW = 'muster-traffic-flow',
  ROAD_CLOSED = 'muster-road-closed'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Muster/MapServer';

export const MusterEventDefinitions = {
  TRAFFIC_FLOW: {
    id: MUSTER_LAYERS.TRAFFIC_FLOW,
    layerId: MUSTER_LAYERS.TRAFFIC_FLOW,
    name: 'Muster Traffic Flow',
    url: `${eventUrl}/0`
  },
  PARKING: {
    id: MUSTER_LAYERS.PARKING,
    layerId: MUSTER_LAYERS.PARKING,
    name: 'Muster Parking',
    url: `${eventUrl}/1`
  },
  ROAD_CLOSED: {
    id: MUSTER_LAYERS.ROAD_CLOSED,
    layerId: MUSTER_LAYERS.ROAD_CLOSED,
    name: 'Road Closed',
    url: `${eventUrl}/2`
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
      name: 'attributes.Event',
      description: 'attributes.STF_Notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          {
            value: 'Green',
            label: 'Recommended Routes',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 3,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Red',
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
      },
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '$feature.STF_Notes'
          },
          minScale: 0,
          maxScale: 0,
          useCodedValues: true,
          allowOverrun: true,
          symbol: {
            type: 'text',
            color: 'red',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              family: 'Arial Unicode MS',
              size: 12,
              weight: 'bold'
            }
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: MusterEventDefinitions.PARKING.id,
    title: MusterEventDefinitions.PARKING.name,
    url: MusterEventDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.MusterN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MusterEventDefinitions.ROAD_CLOSED.id,
    title: MusterEventDefinitions.ROAD_CLOSED.name,
    url: MusterEventDefinitions.ROAD_CLOSED.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'A_Name',
        collapsed: true
      },
      description: {
        field: 'SP_SH_Notes',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '$feature.SP_SH_Notes'
          },
          minScale: 0,
          maxScale: 0,
          useCodedValues: true,
          allowOverrun: true,
          symbol: {
            type: 'text',
            color: 'white',
            haloColor: 'black',
            haloSize: 1,
            angle: 0,
            font: {
              family: 'Arial Unicode MS',
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  }
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
