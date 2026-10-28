import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

// Drawn in this order, top first (docs/map-layers.md, "Drawing order"): the accessible spaces and the traffic flow over
// the lots, whose fill would cover them (#2061).
export enum MUSTER_LAYERS {
  ACCESSIBLE_PARKING = 'muster-accessible-parking',
  TRAFFIC_FLOW = 'muster-traffic-flow',
  PARKING = 'muster-parking'
}

const eventUrl = Connections.musterUrl;
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
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'attributes.edited'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: MusterEventDefinitions.ACCESSIBLE_PARKING.id,
    title: MusterEventDefinitions.ACCESSIBLE_PARKING.name,
    url: MusterEventDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: MusterEventDefinitions.PARKING.id,
    title: MusterEventDefinitions.PARKING.name,
    url: MusterEventDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
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
    columnKey: 'spring',
    keywords: ['muster', 'parking', 'transportation']
  }
};
