import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum VENDOR_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  VENDOR_LOTS = 'Vendor Parking Lots',
  BUSINESS_SPOTS = 'Marked Business Spots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const VendorParking_Definitions = {
  CONSTRUCTION: {
    id: VENDOR_PARKING_LAYERS.CONSTRUCTION,
    layerId: VENDOR_PARKING_LAYERS.CONSTRUCTION,
    name: "Construction",
    url: `${eventUrl}/0`
  },
  VENDOR_LOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_LOTS,
    name: "Vendor Parking Lots",
    url: `${eventUrl}/9`
  },
  BUSINESS_SPOTS: {
    id: VENDOR_PARKING_LAYERS.VENDOR_LOTS,
    layerId: VENDOR_PARKING_LAYERS.VENDOR_LOTS,
    name: "Marked Business Spots",
    url: `${eventUrl}/2`
  }
};

export const VendorParking_ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VendorParking_Definitions.CONSTRUCTION.id,
    title: VendorParking_Definitions.CONSTRUCTION.name,
    url: VendorParking_Definitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: VendorParking_Definitions.VENDOR_LOTS.id,
    title: VendorParking_Definitions.VENDOR_LOTS.name,
    url: VendorParking_Definitions.VENDOR_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: `{attributes.Event}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  {
    type: 'feature',
    id: VendorParking_Definitions.BUSINESS_SPOTS.id,
    title: VendorParking_Definitions.BUSINESS_SPOTS.name,
    url: VendorParking_Definitions.BUSINESS_SPOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
];

export const VendorParking_Configuration: EventConfiguration = {
  id: 'vendor-parking',
  name: "Vendor Parking",
  applicationName: "Vendor Parking Map",
  shortApplicationName: "Vendor Parking",
  eventDates: [],
  zoom: 17,
  mapCenter: [-96.35106, 30.61118]
};

export const VendorParking_Options: SpecialEventOptions = [];

export const VendorParking_Ts: ISpecialEventRoot = {
  configuration: VendorParking_Configuration,
  options: VendorParking_Options,
  sources: VendorParking_ColdLayerSources,
  references: VENDOR_PARKING_LAYERS,
  discover: {
    id: VendorParking_Configuration.id,
    name: VendorParking_Configuration.name,
    description: "Parking Information for Vendors",
    source: 'internal',
    type: 'event',
    keywords: ['vendor', 'parking', 'transportation']
  }
};
