import { LayerSource } from '@tamu-gisc/common/types';

import { MUSTER_LAYERS } from '../interfaces/muster.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

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
            }
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
            }
          }
        ]
      } as any
    }
  }
];

export const MusterConfiguration: EventConfiguration = {
  id: 'muster',
  name: 'Muster',
  applicationName: 'Muster Parking Map',
  shortApplicationName: 'Muster Map',
  eventDates: ['2025-04-21'],
  zoom: 16
};

export const MusterOptions: SpecialEventOptions = [];
