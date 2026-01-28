import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum NSC_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  NSC_PARKING_LOTS = 'NSC Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const NscParkingDefinitions = {
  CONSTRUCTION: {
    id: NSC_PARKING_LAYERS.CONSTRUCTION,
    layerId: NSC_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  NSC_PARKING_LOTS: {
    id: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    layerId: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    name: 'NSC Parking Lots',
    url: `${eventUrl}/11`
  }
};

export const NscParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: NscParkingDefinitions.CONSTRUCTION.id,
    title: NscParkingDefinitions.CONSTRUCTION.name,
    url: NscParkingDefinitions.CONSTRUCTION.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: NscParkingDefinitions.NSC_PARKING_LOTS.id,
    title: NscParkingDefinitions.NSC_PARKING_LOTS.name,
    url: NscParkingDefinitions.NSC_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'GIS.TS.Lot_Use.NSCm',
        uniqueValueInfos: [
          {
            value: '1',
            label: 'NSC Permit Authorized',
            symbol: {
              type: 'simple-fill',
              color: 'rgb(90, 0, 0)'
            } as unknown as esri.SimpleFillSymbolProperties
          }
        ]
      }
    }
  }
];

export const NscParkingConfiguration: EventConfiguration = {
  id: 'nsc-parking',
  name: 'New Student Conference Parking',
  applicationName: 'New Student Conference Parking Map',
  shortApplicationName: 'NSC Parking Map',
  introductionText: 'Parking map for New Student Conference.',
  eventDates: [],
  mapCenter: [-96.33771, 30.62143],
  zoom: 17
};

export const NscParkingOptions: SpecialEventOptions = [];

export const NscParkingTs: ISpecialEventRoot = {
  configuration: NscParkingConfiguration,
  options: NscParkingOptions,
  sources: NscParkingColdLayerSources,
  references: NSC_PARKING_LAYERS,
  discover: {
    id: NscParkingConfiguration.id,
    name: NscParkingConfiguration.name,
    description: 'Parking information for New Student Conference.',
    source: 'internal',
    type: 'event',
    keywords: ['nsc', 'new student conference', 'parking', 'transportation']
  }
};
