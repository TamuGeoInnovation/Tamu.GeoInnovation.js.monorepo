import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum RETIREE_PARKING_LAYERS {
  LOT_SPECIFIC = 'Lot Specific Permit Required',
  RETIREE_AUTHORIZED = 'Retiree Permit Authorized',
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const RetireeParkingDefinitions = {
  LOT_SPECIFIC: {
    id: RETIREE_PARKING_LAYERS.LOT_SPECIFIC,
    layerId: RETIREE_PARKING_LAYERS.LOT_SPECIFIC,
    name: 'Lot Specific Permit Required',
    url: `${eventUrl}/7`
  },
  RETIREE_AUTHORIZED: {
    id: RETIREE_PARKING_LAYERS.RETIREE_AUTHORIZED,
    layerId: RETIREE_PARKING_LAYERS.RETIREE_AUTHORIZED,
    name: 'Retiree Permit Authorized',
    url: `${eventUrl}/7`
  }
};

export const RetireeParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: RetireeParkingDefinitions.RETIREE_AUTHORIZED.id,
    title: RetireeParkingDefinitions.RETIREE_AUTHORIZED.name,
    url: RetireeParkingDefinitions.RETIREE_AUTHORIZED.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Retired_Lot" = 1`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [90, 0, 0, 255],
          outline: null
        }
      }
    } as any
  },
  {
    type: 'feature',
    id: RetireeParkingDefinitions.LOT_SPECIFIC.id,
    title: RetireeParkingDefinitions.LOT_SPECIFIC.name,
    url: RetireeParkingDefinitions.LOT_SPECIFIC.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Retired_Lot" <> 1 OR "GIS.TS.Lot_Use.Retired_Lot" IS NULL`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [204, 204, 204, 255],
          outline: null
        }
      }
    } as any
  }
];

export const RetireeParkingConfiguration: EventConfiguration = {
  id: 'retiree-parking',
  name: 'Retiree Parking',
  applicationName: 'Retiree Parking Map',
  shortApplicationName: 'Retiree Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const RetireeParkingOptions: SpecialEventOptions = [];

export const RetireeParkingTs: ISpecialEventRoot = {
  configuration: RetireeParkingConfiguration,
  options: RetireeParkingOptions,
  sources: RetireeParkingColdLayerSources,
  references: RETIREE_PARKING_LAYERS,
  discover: {
    id: RetireeParkingConfiguration.id,
    name: RetireeParkingConfiguration.name,
    description: 'Parking lot information for Retiree permits.',
    source: 'internal',
    type: 'event',
    keywords: ['retiree', 'parking', 'permit']
  }
};
