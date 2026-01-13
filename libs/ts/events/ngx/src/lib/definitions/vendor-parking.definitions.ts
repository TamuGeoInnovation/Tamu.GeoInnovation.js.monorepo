import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

// import esri = __esri

export enum VENDOR_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  MARKED_BUSINESS_SPACES = 'Marked Business Spaces',
  VENDOR_PARKING_LOTS = 'Vendor Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const VendorParkingDefinitions = {
  CONSTRUCTION: {
    id: VENDOR_PARKING_LAYERS.CONSTRUCTION,
    layerId: VENDOR_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  MARKED_BUSINESS_SPACES: {
    id: VENDOR_PARKING_LAYERS.MARKED_BUSINESS_SPACES,
    layerId: VENDOR_PARKING_LAYERS.MARKED_BUSINESS_SPACES,
    name: 'Marked Business Spaces',
    url: `${eventUrl}/2`
  },
    VENDOR_PARKING_LOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_PARKING_LOTS,
    name: 'Vendor Parking Lots',
    url: `${eventUrl}/9`
  }
};

export const VendorParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VendorParkingDefinitions.CONSTRUCTION.id,
    title: VendorParkingDefinitions.CONSTRUCTION.name,
    url: VendorParkingDefinitions.CONSTRUCTION.url,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: VendorParkingDefinitions.MARKED_BUSINESS_SPACES.id,
    title: VendorParkingDefinitions.MARKED_BUSINESS_SPACES.name,
    url: VendorParkingDefinitions.MARKED_BUSINESS_SPACES.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    visible: true,
    native: {
      outFields: ['*']
    },
  },

  {
    type: 'feature',
    id: VendorParkingDefinitions.VENDOR_PARKING_LOTS.id,
    title: VendorParkingDefinitions.VENDOR_PARKING_LOTS.name,
    url: VendorParkingDefinitions.VENDOR_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      outFields: ['*'],
      // renderer: {
      //   type: 'unique-value',
      //   field: 'GIS.TS.Lot_Use.Vendor_Lot',
      //   field2: 'GIS.TS.ParkingLots.LotType',
      //   fieldDelimiter: ',',
      //   uniqueValueInfos: [
      //             {
      //               value: '1,Surface',
      //               label: 'Vender Permit and Vendor+ Permit Authorized',
      //               symbol: {
      //                 type: 'simple-fill',
      //                 color: 'rgb(90, 0, 0)'
      //               } as unknown as esri.SimpleFillSymbolProperties
      //             },
      //             {
      //               value: '1,Street',
      //               label: 'Vender Permit and Vendor+ Permit Authorized',
      //               symbol: {
      //                 type: 'simple-fill',
      //                 color: 'rgb(90, 0, 0)'
      //               } as unknown as esri.SimpleFillSymbolProperties
      //             },
      //             {
      //               value: '1,Garage Visitor',
      //               label: 'Vender Permit and Vendor+ Permit Authorized',
      //               symbol: {
      //                 type: 'simple-fill',
      //                 color: 'rgb(90, 0, 0)'
      //               } as unknown as esri.SimpleFillSymbolProperties
      //             },
      //           ]
      // }
    },
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

export const VendorParking_Ts: ISpecialEventRoot = {
  configuration: VendorParkingConfiguration,
  options: VendorParkingOptions,
  sources: VendorParkingColdLayerSources,
  references: VENDOR_PARKING_LAYERS,
  discover: {
    id: VendorParkingConfiguration.id,
    name: VendorParkingConfiguration.name,
    description: 'Parking information for vendors.',
    source: 'internal',
    type: 'event',
    keywords: ['vendor', 'parking', 'transportation']
  }
};

