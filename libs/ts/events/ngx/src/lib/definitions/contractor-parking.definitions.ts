import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  EventConfiguration,
  AggiemapCustomMapConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum CONTRACTOR_PARKING_LAYERS {
  CONTRACTOR_AND_CONTRACTOR_PLUS = 'Contractor Permit and Contractor+ Permit Authorized',
  CONTRACTOR_PLUS_ONLY = 'Only Contractor+ Permit Authorized'
}
const eventUrl = Connections.contractorParkingUrl;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

export const ContractorParkingDefinitions = {
  CONTRACTOR_AND_CONTRACTOR_PLUS: {
    id: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_AND_CONTRACTOR_PLUS,
    layerId: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_AND_CONTRACTOR_PLUS,
    name: 'Contractor Permit and Contractor+ Permit Authorized',
    url: `${eventUrl}/0`
  },
  CONTRACTOR_PLUS_ONLY: {
    id: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PLUS_ONLY,
    layerId: CONTRACTOR_PARKING_LAYERS.CONTRACTOR_PLUS_ONLY,
    name: 'Only Contractor+ Permit Authorized',
    url: `${eventUrl}/0`
  }
};

export const ContractorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.id,
    title: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.name,
    url: ContractorParkingDefinitions.CONTRACTOR_AND_CONTRACTOR_PLUS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.ContractorN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Construct_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Street', 'Surface')`
}
  },
  {
    type: 'feature',
    id: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.id,
    title: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.name,
    url: ContractorParkingDefinitions.CONTRACTOR_PLUS_ONLY.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.ContractorN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Construct_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage Visitor')`
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

export const ContractorParkingTs: AggiemapCustomMapConfiguration = {
  configuration: ContractorParkingConfiguration,
  options: ContractorParkingOptions,
  sources: ContractorParkingColdLayerSources,
  references: CONTRACTOR_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: ContractorParkingConfiguration.id,
    name: ContractorParkingConfiguration.name,
    description: 'Parking lot information for Contractor and Contractor+ permits.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'business',
    keywords: ['contractor', 'contractor+', 'parking', 'permit']
  }
};
