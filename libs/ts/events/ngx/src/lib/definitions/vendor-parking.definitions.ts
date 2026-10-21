import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import { EventPopups } from '../modules/popups/popups';
import { lotFill } from './common.definitions';

export enum VENDOR_PARKING_LAYERS {
  VENDOR_PARKING_LOTS = 'vendor-parking-lots',
  VENDOR_PLUS_ONLY_LOTS = 'vendor-parking-vendor-plus-only-lots'
}

const eventUrl = Connections.vendorParkingUrl;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

export const VendorParkingDefinitions = {
  VENDOR_PARKING_LOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    name: 'Vendor Permit and Vendor+ Permit Authorized',
    url: `${eventUrl}/0`
  },
  VENDOR_PLUS_ONLY_LOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_PLUS_ONLY_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_PLUS_ONLY_LOTS,
    name: 'Only Vendor+ Permit Authorized',
    url: `${eventUrl}/0`
  }
};

const popupData = {
  name: {
    field: 'GIS.TS.ParkingLots.Name',
    collapsed: true
  },
  description: {
    field: 'GIS.TS.Lot_Notes.VendorN',
    collapsed: true
  }
};

// Why the lots are two layers, each with its own renderer (#1991, as Business Parking's #1981): the
// service's renderer keys on `GIS.TS.Lot_Use.Vendor_Lot` and `GIS.TS.ParkingLots.LotType`, but the
// service does not publish `LotType` (it is not in the layer's field list), so no lot reaches the browser
// with a value the renderer has a symbol for, and the renderer has no default: the layer held its lots
// and drew none of them, and a lot could not be clicked for its notes. The published field cannot tell
// the renderer's two groups apart (`Vendor_Lot` is 1 on every lot), but the server still filters on
// `LotType`, so each layer's definition expression selects one group and draws it in that group's fill.
// The two expressions cover every lot the service holds (56 and 6 of 62 on 20 October 2026). Remove the
// renderers, and go back to one layer, once the service publishes `LotType`.
//
// This also replaces the hidden map-image layer that drew the lots on the server since #611, which was
// a workaround for the same fault: it drew the colours, but it could not be clicked.
export const VendorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VendorParkingDefinitions.VENDOR_PARKING_LOTS.id,
    title: VendorParkingDefinitions.VENDOR_PARKING_LOTS.name,
    url: VendorParkingDefinitions.VENDOR_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData,
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Vendor_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Street', 'Surface')`,
      // Overridden: the service's renderer keys on LotType, which it does not publish (#1991, above).
      renderer: lotFill(VendorParkingDefinitions.VENDOR_PARKING_LOTS.name, [90, 0, 0, 255])
    } as FeatureNative
  },
  {
    type: 'feature',
    id: VendorParkingDefinitions.VENDOR_PLUS_ONLY_LOTS.id,
    title: VendorParkingDefinitions.VENDOR_PLUS_ONLY_LOTS.name,
    url: VendorParkingDefinitions.VENDOR_PLUS_ONLY_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData,
    native: {
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Vendor_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage Visitor')`,
      // Overridden: the service's renderer keys on LotType, which it does not publish (#1991, above).
      renderer: lotFill(VendorParkingDefinitions.VENDOR_PLUS_ONLY_LOTS.name, [232, 190, 255, 255])
    } as FeatureNative
  }
];

export const VendorParkingConfiguration: EventConfiguration = {
  id: 'vendor-parking',
  name: 'Vendor Parking',
  applicationName: 'Vendor Parking Map',
  shortApplicationName: 'Vendor Parking Map',
  introductionText: 'Parking Map for Vendors',
  eventDates: [],
  mapCenter: [-96.33771, 30.62143],
  zoom: 17
};

export const VendorParkingOptions: SpecialEventOptions = [];

export const VendorParking_Ts: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: VendorParkingConfiguration,
  options: VendorParkingOptions,
  sources: VendorParkingColdLayerSources,
  references: VENDOR_PARKING_LAYERS,
  discover: {
    id: VendorParkingConfiguration.id,
    name: VendorParkingConfiguration.name,
    description: 'Parking information for vendors.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'business',
    keywords: ['vendor', 'parking', 'transportation']
  }
};
