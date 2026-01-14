import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum CONTRACTOR_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  CONTRACTOR_AND_CONTRACTOR_PLUS = 'Contractor Permit and Contractor+ Permit Authorized',
  CONTRACTOR_PLUS_ONLY = 'Only Contractor+ Permit Authorized',
  LOT_SPECIFIC = 'Lot Specific Permit Required',
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const ContractorParkingDefinitions = {
  CONSTRUCTION: {
    id: CONTRACTOR_PARKING_LAYERS.CONSTRUCTION,
    layerId: CONTRACTOR_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  CONTRACTOR_AND_CONTRACTOR_PLUS: {
    id: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_AND_CONTRACTOR_PLUS,
    layerId: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_AND_CONTRACTOR_PLUS,
    name: 'Contractor Permit and Contractor+ Permit Authorized',
    url: `${eventUrl}/7`
  },
  CONTRACTOR_PLUS_ONLY: {
    id: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PLUS_ONLY,
    layerId: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PLUS_ONLY,
    name: 'Only Contractor+ Permit Authorized',
    url: `${eventUrl}/7`
  },
  LOT_SPECIFIC: {
    id: CONTRACTOR_PARKING_LAYERS.LOT_SPECIFIC,
    layerId: CONTRACTOR_PARKING_LAYERS.LOT_SPECIFIC,
    name: 'Lot Specific Permit Required',
    url: `${eventUrl}/7`
  }
};

export const ContractorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ContractorParkingDefinitions.CONSTRUCTION.id,
    title: ContractorParkingDefinitions.CONSTRUCTION.name,
    url: ContractorParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.id,
    title: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.name,
    url: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.Contractor_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Surface', 'Street')`,
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
    id: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.id,
    title: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.name,
    url: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.Contractor_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage', 'Garage Visitor')`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [232, 190, 255, 255],
          outline: null
        }
      }
    }
  },
  {
    type: 'feature',
    id: ContractorParkingDefinitions.LOT_SPECIFIC.id,
    title: ContractorParkingDefinitions.LOT_SPECIFIC.name,
    url: ContractorParkingDefinitions.LOT_SPECIFIC.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.Contractor_Lot" <> 1 OR "GIS.TS.Lot_Use.Contractor_Lot" IS NULL`,
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

export const ContractorParkingConfiguration: EventConfiguration = {
  id: 'contractor-parking',
  name: 'Contractor Parking',
  applicationName: 'Contractor Parking Map',
  shortApplicationName: 'Contractor Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const ContractorParkingOptions: SpecialEventOptions = [];

export const ContractorParkingTs: ISpecialEventRoot = {
  configuration: ContractorParkingConfiguration,
  options: ContractorParkingOptions,
  sources: ContractorParkingColdLayerSources,
  references: CONTRACTOR_PARKING_LAYERS,
  discover: {
    id: ContractorParkingConfiguration.id,
    name: ContractorParkingConfiguration.name,
    description: 'Parking lot information for Contractor and Contractor+ permits.',
    source: 'internal',
    type: 'event',
    keywords: ['contractor', 'parking', 'permit']
  }
};
