import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum BUSINESS_PARKING_LAYERS {
  UB_2_HOUR_SPACES = 'University Business Spaces 2 Hour Time Limit',
  LOT_SPECIFIC = 'Lot Specific Permit Required',
  UB_AND_UB_PLUS = 'UB Permit and UB+ Permit Authorized',
  UB_PLUS_ONLY = 'Only UB+ Permit Authorized'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

const ubAndUbPlusRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [90, 0, 0, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 0],
      width: 0
    }
  }
};

const ubPlusOnlyRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [232, 190, 255, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 0],
      width: 0
    }
  }
};

const lotSpecificRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [204, 204, 204, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 0],
      width: 0
    }
  }
};

export const BusinessParkingDefinitions = {
    UB_2_HOUR_SPACES: {
    id: BUSINESS_PARKING_LAYERS.UB_2_HOUR_SPACES,
    layerId: BUSINESS_PARKING_LAYERS.UB_2_HOUR_SPACES,
    name: 'University Business Spaces 2 Hour Time Limit',
    url: `${eventUrl}/2`
  },
  LOT_SPECIFIC: {
    id: BUSINESS_PARKING_LAYERS.LOT_SPECIFIC,
    layerId: BUSINESS_PARKING_LAYERS.LOT_SPECIFIC,
    name: 'Lot Specific Permit Required',
    url: `${eventUrl}/8`
  },
  UB_AND_UB_PLUS: {
    id: BUSINESS_PARKING_LAYERS.UB_AND_UB_PLUS,
    layerId: BUSINESS_PARKING_LAYERS.UB_AND_UB_PLUS,
    name: 'UB Permit and UB+ Permit Authorized',
    url: `${eventUrl}/8`
  },
  UB_PLUS_ONLY: {
    id: BUSINESS_PARKING_LAYERS.UB_PLUS_ONLY,
    layerId: BUSINESS_PARKING_LAYERS.UB_PLUS_ONLY,
    name: 'Only UB+ Permit Authorized',
    url: `${eventUrl}/8`
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
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.UB_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Street', 'Surface', 'Surface Visitor')`,
      renderer: ubAndUbPlusRenderer
    }
  },
  {
    type: 'feature',
    id: BusinessParkingDefinitions.UB_PLUS_ONLY.id,
    title: BusinessParkingDefinitions.UB_PLUS_ONLY.name,
    url: BusinessParkingDefinitions.UB_PLUS_ONLY.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.UB_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage', 'Garage Visitor')`,
      renderer: ubPlusOnlyRenderer
    }
  },
  {
    type: 'feature',
    id: BusinessParkingDefinitions.LOT_SPECIFIC.id,
    title: BusinessParkingDefinitions.LOT_SPECIFIC.name,
    url: BusinessParkingDefinitions.LOT_SPECIFIC.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression:
        `"GIS.TS.Lot_Use.UB_Lot" <> 1 OR "GIS.TS.Lot_Use.UB_Lot" IS NULL OR "GIS.TS.ParkingLots.LotType" NOT IN ('Street', 'Surface', 'Surface Visitor', 'Garage', 'Garage Visitor') OR "GIS.TS.ParkingLots.LotType" IS NULL`,
      renderer: lotSpecificRenderer
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

export const BusinessParkingTs: ISpecialEventRoot = {
  configuration: BusinessParkingConfiguration,
  options: BusinessParkingOptions,
  sources: BusinessParkingColdLayerSources,
  references: BUSINESS_PARKING_LAYERS,
  discover: {
    id: BusinessParkingConfiguration.id,
    name: BusinessParkingConfiguration.name,
    description: 'Parking lot information for University Business permits.',
    source: 'internal',
    type: 'event',
    keywords: ['business', 'university business', 'ub', 'ub+', 'parking', 'permit', '2 hour']
  }
};
