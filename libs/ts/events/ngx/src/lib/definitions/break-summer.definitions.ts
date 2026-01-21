import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum BREAK_SUMMER_PARKING_LAYERS {
  BREAK_SUMMER_PARKING = 'break-summer-parking',
  CONSTRUCTION = 'construction'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const BreakSummerParkingEventDefinitions = {
  BREAK_SUMMER_PARKING: {
    id: BREAK_SUMMER_PARKING_LAYERS.BREAK_SUMMER_PARKING,
    layerId: BREAK_SUMMER_PARKING_LAYERS.BREAK_SUMMER_PARKING,
    name: 'Break-Summer Parking Lots',
    url: `${eventUrl}/5`
  },
  CONSTRUCTION: {
    id: BREAK_SUMMER_PARKING_LAYERS.CONSTRUCTION,
    layerId: BREAK_SUMMER_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  }
};

export const BreakSummerParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BreakSummerParkingEventDefinitions.BREAK_SUMMER_PARKING.id,
    title: BreakSummerParkingEventDefinitions.BREAK_SUMMER_PARKING.name,
    url: BreakSummerParkingEventDefinitions.BREAK_SUMMER_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple-fill',
        symbol: {
          type: 'simple-fill',
          color: [70, 130, 180, 0.6],
          outline: {
            color: [0, 0, 0],
            width: 2
          }
        }
      } as unknown as esri.RendererProperties
    }
  },

  {
    type: 'feature',
    id: BreakSummerParkingEventDefinitions.CONSTRUCTION.id,
    title: BreakSummerParkingEventDefinitions.CONSTRUCTION.name,
    url: BreakSummerParkingEventDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [70, 130, 180, 0.6],
          outline: {
            color: [0, 0, 0],
            width: 2
          }
        }
      } as unknown as esri.SimpleRendererProperties
    }
];

export const BreakSummerParkingConfiguration: EventConfiguration = {
  id: 'break-summer-parking',
  name: 'Break/Summer Parking',
  applicationName: 'Break/Summer Parking Map',
  shortApplicationName: 'Break/Summer Parking Map',
  eventDates: [],
  mapCenter: [-96.34467, 30.60585],
  zoom: 16
};

export const BreakSummerParkingOptions: SpecialEventOptions = [];

export const BreakSummerParkingTs: ISpecialEventRoot = {
  configuration: BreakSummerParkingConfiguration,
  sources: BreakSummerParkingColdLayerSources,
  options: BreakSummerParkingOptions,
  references: BREAK_SUMMER_PARKING_LAYERS,
  discover: {
    id: BreakSummerParkingConfiguration.id,
    name: BreakSummerParkingConfiguration.name,
    description: 'Parking areas authorized during break and summer sessions.',
    source: 'internal',
    type: 'event',
    keywords: ['break', 'summer', 'parking', 'transportation']
  }
};
