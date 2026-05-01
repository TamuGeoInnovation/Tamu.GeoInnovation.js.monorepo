import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum VENDOR_PARKING_LAYERS {
  VENDOR_PARKING_DRAW = 'vendor-parking-lots-draw',
  VENDOR_PARKING_LOTS = 'vendor-parking-lots'
}

const eventUrl = Connections('gis.tamu.edu').vendorParkingUrl;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

const vendorParkingRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.Lot_Use.Vendor_Lot',
  field2: 'GIS.TS.ParkingLots.LotType',
  fieldDelimiter: ',',
  defaultLabel: ' ', // definitely need a better solution for this but this is to prevent the default symbol from showing in the legend
  defaultSymbol: {
    type: 'simple-fill',
    color: [0, 0, 0, 0],
    outline: null
  } as unknown as esri.SymbolProperties,
  uniqueValueInfos: [
    {
      value: '1,Street',
      label: 'Vendor Permit and Vendor+ Permit Authorized',
      symbol: { type: 'simple-fill', color: [90, 0, 0, 255], outline: null } as unknown as esri.SymbolProperties
    },
    {
      value: '1,Surface',
      label: 'Vendor Permit and Vendor+ Permit Authorized',
      symbol: { type: 'simple-fill', color: [90, 0, 0, 255], outline: null } as unknown as esri.SymbolProperties
    },
    {
      value: '1,Garage Visitor',
      label: 'Only Vendor+ Permit Authorized',
      symbol: { type: 'simple-fill', color: [232, 190, 255, 255], outline: null } as unknown as esri.SymbolProperties
    }
  ]
};

export const VendorParkingDefinitions = {
  VENDOR_PARKING_DRAW: {
    id: VENDOR_PARKING_LAYERS.VENDOR_PARKING_DRAW,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_PARKING_DRAW,
    name: 'Vendor Parking Lots (Draw)',
    url: eventUrl
  },
  VENDOR_PARKING_LOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    name: 'Vendor Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const VendorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'map-image',
    id: VendorParkingDefinitions.VENDOR_PARKING_DRAW.id,
    title: VendorParkingDefinitions.VENDOR_PARKING_DRAW.name,
    url: VendorParkingDefinitions.VENDOR_PARKING_DRAW.url,
    visible: true,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 0,
          title: 'Vendor Parking Lots',
          visible: true,
          popupEnabled: false,
          labelsVisible: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  },
  {
    type: 'feature',
    id: VendorParkingDefinitions.VENDOR_PARKING_LOTS.id,
    title: VendorParkingDefinitions.VENDOR_PARKING_LOTS.name,
    url: VendorParkingDefinitions.VENDOR_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.VendorN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      renderer: vendorParkingRenderer
    } as unknown as FeatureNative
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
    keywords: ['vendor', 'parking', 'transportation']
  }
};
