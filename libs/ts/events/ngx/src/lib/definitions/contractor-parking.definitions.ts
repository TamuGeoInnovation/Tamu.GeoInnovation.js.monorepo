import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';


export enum CONTRACTOR_PARKING_LAYERS {
  CONSTRUCTION = 'construction',
  CONTRACTOR_PARKING = 'contractor-parking'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const ContractorParkingEventDefinitions = {
  CONTRACTOR_PARKING: {
    id: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PARKING,
    layerId: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PARKING,
    name: 'Contractor Parking Lots',
    url: `${eventUrl}/7`
  },
  CONSTRUCTION: {
    id: CONTRACTOR_PARKING_LAYERS.CONSTRUCTION,
    layerId: CONTRACTOR_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  }
};

export const ContractorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ContractorParkingEventDefinitions.CONTRACTOR_PARKING.id,
    title: ContractorParkingEventDefinitions.CONTRACTOR_PARKING.name,
    url: ContractorParkingEventDefinitions.CONTRACTOR_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: ContractorParkingEventDefinitions.CONSTRUCTION.id,
    title: ContractorParkingEventDefinitions.CONSTRUCTION.name,
    url: ContractorParkingEventDefinitions.CONSTRUCTION.url,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*'],
    }
  }
];

export const ContractorParkingConfiguration: EventConfiguration = {
  id: 'contractor-parking',
  name: 'Contractor Parking',
  applicationName: 'Contractor Parking Map',
  shortApplicationName: 'Contractor Parking Map',
  eventDates: [],
  mapCenter: [-96.34467, 30.60585],
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
    description: 'Parking areas designated for contractors.',
    source: 'internal',
    type: 'event',
    keywords: ['contractor', 'parking', 'transportation']
  }
};
