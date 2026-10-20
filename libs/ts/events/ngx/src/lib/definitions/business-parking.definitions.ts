import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';
import { lotFill } from './common.definitions';

export enum BUSINESS_PARKING_LAYERS {
  UB_2_HOUR_SPACES = 'University Business Spaces 2 Hour Time Limit',
  UB_AND_UB_PLUS = 'UB Permit and UB+ Permit Authorized',
  UB_PLUS_ONLY = 'Only UB+ Permit Authorized'
}
const eventUrl = Connections.businessParkingUrl;

// Why the two lot layers set their own renderer (#1981): the service's renderer keys on
// `GIS.TS.Lot_Use.UB_Lot` and `GIS.TS.ParkingLots.LotType`, but the service does not publish `LotType`
// (it is not in the layer's field list, and asking for it as an output field fails), so no lot reaches
// the browser with a value the renderer has a symbol for, and the renderer has no default: the layers
// loaded, held their lots, and drew none of them. Each layer's definition expression already selects one
// of the renderer's two groups, so one fill per layer, in that group's colour, draws exactly what the
// service's renderer meant to. Remove them once the service publishes `LotType`.

export const BusinessParkingDefinitions = {
  UB_2_HOUR_SPACES: {
    id: BUSINESS_PARKING_LAYERS.UB_2_HOUR_SPACES,
    layerId: BUSINESS_PARKING_LAYERS.UB_2_HOUR_SPACES,
    name: 'University Business Spaces 2 Hour Time Limit',
    url: `${eventUrl}/0`
  },
  UB_AND_UB_PLUS: {
    id: BUSINESS_PARKING_LAYERS.UB_AND_UB_PLUS,
    layerId: BUSINESS_PARKING_LAYERS.UB_AND_UB_PLUS,
    name: 'UB Permit and UB+ Permit Authorized',
    url: `${eventUrl}/1`
  },
  UB_PLUS_ONLY: {
    id: BUSINESS_PARKING_LAYERS.UB_PLUS_ONLY,
    layerId: BUSINESS_PARKING_LAYERS.UB_PLUS_ONLY,
    name: 'Only UB+ Permit Authorized',
    url: `${eventUrl}/1`
  }
};

export const BusinessParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BusinessParkingDefinitions.UB_2_HOUR_SPACES.id,
    title: BusinessParkingDefinitions.UB_2_HOUR_SPACES.name,
    url: BusinessParkingDefinitions.UB_2_HOUR_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.LotName}',
      description: {
        field: 'Spc_ID_Num',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `Spc_Type = 'UB'`
    }
  },
  {
    type: 'feature',
    id: BusinessParkingDefinitions.UB_AND_UB_PLUS.id,
    title: BusinessParkingDefinitions.UB_AND_UB_PLUS.name,
    url: BusinessParkingDefinitions.UB_AND_UB_PLUS.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.UBN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.UB_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Street', 'Surface', 'Surface Visitor')`,
      // Overridden: the service's renderer keys on LotType, which it does not publish (#1981, above).
      renderer: lotFill(BusinessParkingDefinitions.UB_AND_UB_PLUS.name, [90, 0, 0, 255])
    }
  },
  {
    type: 'feature',
    id: BusinessParkingDefinitions.UB_PLUS_ONLY.id,
    title: BusinessParkingDefinitions.UB_PLUS_ONLY.name,
    url: BusinessParkingDefinitions.UB_PLUS_ONLY.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.UBN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.UB_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage', 'Garage Visitor')`,
      // Overridden: the service's renderer keys on LotType, which it does not publish (#1981, above).
      renderer: lotFill(BusinessParkingDefinitions.UB_PLUS_ONLY.name, [232, 190, 255, 255])
    }
  }
];

export const BusinessParkingConfiguration: EventConfiguration = {
  id: 'business-parking',
  name: 'Business Parking',
  applicationName: 'Business Parking Transportation Map',
  shortApplicationName: 'Business Parking Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const BusinessParkingOptions: SpecialEventOptions = [];

export const BusinessParkingTs: AggiemapCustomMapConfiguration = {
  configuration: BusinessParkingConfiguration,
  options: BusinessParkingOptions,
  sources: BusinessParkingColdLayerSources,
  references: BUSINESS_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: BusinessParkingConfiguration.id,
    name: BusinessParkingConfiguration.name,
    description: 'Parking lot information for University Business permits.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'business',
    keywords: ['business', 'university business', 'ub', 'ub+', 'parking', 'permit', '2 hour']
  }
};
