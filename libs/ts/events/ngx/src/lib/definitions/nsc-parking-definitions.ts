import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum NSC_PARKING_LAYERS {
  LOT_SPECIFIC = 'Lot Specific Permit Required',
  NSC_AUTHORIZED = 'NSC Permit Authorized',
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const NscParkingDefinitions = {
  LOT_SPECIFIC: {
    id: NSC_PARKING_LAYERS.LOT_SPECIFIC,
    layerId: NSC_PARKING_LAYERS.LOT_SPECIFIC,
    name: 'Lot Specific Permit Required',
    url: `${eventUrl}/11`
  },
  NSC_AUTHORIZED: {
    id: NSC_PARKING_LAYERS.NSC_AUTHORIZED,
    layerId: NSC_PARKING_LAYERS.NSC_AUTHORIZED,
    name: 'NSC Permit Authorized',
    url: `${eventUrl}/11`
  }
};

export const NscParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: NscParkingDefinitions.NSC_AUTHORIZED.id,
    title: NscParkingDefinitions.NSC_AUTHORIZED.name,
    url: NscParkingDefinitions.NSC_AUTHORIZED.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: '*',
      definitionExpression: `"GIS.TS.Lot_Use.NSCm" = 1`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [90, 0, 0, 255],
          outline: null
        }
      }
    }
  },
  {
    type: 'feature',
    id: NscParkingDefinitions.LOT_SPECIFIC.id,
    title: NscParkingDefinitions.LOT_SPECIFIC.name,
    url: NscParkingDefinitions.LOT_SPECIFIC.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.NSCm" <> 1 OR "GIS.TS.Lot_Use.NSCm" IS NULL`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [204, 204, 204, 255],
          outline: null
        }
      }
    }
  }
];

export const NscParkingConfiguration: EventConfiguration = {
  id: 'nsc-parking',
  name: 'New Student Conference',
  applicationName: 'New Student Conference Parking Map',
  shortApplicationName: 'NSC Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
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
    description: 'Parking lot information for New Student Conference (NSC) permits.',
    source: 'internal',
    type: 'event',
    keywords: ['new student conference', 'nsc', 'parking', 'permit']
  }
};
