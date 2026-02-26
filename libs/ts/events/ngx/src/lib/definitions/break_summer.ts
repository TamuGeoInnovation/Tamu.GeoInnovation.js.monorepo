import { LayerSource } from '@tamu-gisc/common/types';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum BREAK_SUMMER_LAYERS {
  BREAK_SUMMER_PARKING = 'Break-Summer Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const BreakSummerDefinitions = {
  BREAK_SUMMER_PARKING: {
    id: BREAK_SUMMER_LAYERS.BREAK_SUMMER_PARKING,
    layerId: BREAK_SUMMER_LAYERS.BREAK_SUMMER_PARKING,
    name: 'Break-Summer Parking Lots',
    url: `${eventUrl}/5`
  }
};

export const BreakSummerColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BreakSummerDefinitions.BREAK_SUMMER_PARKING.id,
    title: BreakSummerDefinitions.BREAK_SUMMER_PARKING.name,
    url: BreakSummerDefinitions.BREAK_SUMMER_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const BreakSummerConfiguration: EventConfiguration = {
  id: 'break-summer',
  name: 'Break / Summer',
  applicationName: 'Break / Summer Transportation Map',
  shortApplicationName: 'Break / Summer Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const BreakSummerOptions: SpecialEventOptions = [];

export const BreakSummerTs: AggiemapCustomMapConfiguration = {
  configuration: BreakSummerConfiguration,
  options: BreakSummerOptions,
  sources: BreakSummerColdLayerSources,
  references: BREAK_SUMMER_LAYERS,
  type: 'general-map',
  discover: {
    id: BreakSummerConfiguration.id,
    name: BreakSummerConfiguration.name,
    description: 'Parking lot authorization information for Break and Summer.',
    source: 'internal',
    type: 'parking',
    keywords: ['break', 'summer', 'parking', 'permit']
  }
};
