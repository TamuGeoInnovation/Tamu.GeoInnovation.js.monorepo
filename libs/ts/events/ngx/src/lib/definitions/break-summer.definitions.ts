import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

// import esri = __esri

export enum BREAK_SUMMER_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  BREAK_SUMMER_PARKING_LOTS = 'Break-Summer Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const BreakSummerParkingDefinitions = {
  CONSTRUCTION: {
    id: BREAK_SUMMER_PARKING_LAYERS.CONSTRUCTION,
    layerId: BREAK_SUMMER_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  BREAK_SUMMER_PARKING_LOTS: {
    id: BREAK_SUMMER_PARKING_LAYERS.BREAK_SUMMER_PARKING_LOTS,
    layerId: BREAK_SUMMER_PARKING_LAYERS.BREAK_SUMMER_PARKING_LOTS,
    name: 'Break-Summer Parking Lots',
    url: `${eventUrl}/5`
  }
};

export const BreakSummerParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BreakSummerParkingDefinitions.CONSTRUCTION.id,
    title: BreakSummerParkingDefinitions.CONSTRUCTION.name,
    url: BreakSummerParkingDefinitions.CONSTRUCTION.url,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BreakSummerParkingDefinitions.BREAK_SUMMER_PARKING_LOTS.id,
    title: BreakSummerParkingDefinitions.BREAK_SUMMER_PARKING_LOTS.name,
    url: BreakSummerParkingDefinitions.BREAK_SUMMER_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      outFields: ['*']
    }
  }
];

export const BreakSummerParkingConfiguration: EventConfiguration = {
  id: 'break-summer-parking',
  name: 'Break/Summer Parking',
  applicationName: 'Break/Summer Parking Map',
  shortApplicationName: 'Break/Summer Parking Map',
  introductionText: 'Parking areas authorized during break and summer sessions.',
  eventDates: [],
  mapCenter: [-96.34467, 30.60585],
  zoom: 16
};

export const BreakSummerParkingOptions: SpecialEventOptions = [];

export const BreakSummerParkingTs: ISpecialEventRoot = {
  configuration: BreakSummerParkingConfiguration,
  options: BreakSummerParkingOptions,
  sources: BreakSummerParkingColdLayerSources,
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
