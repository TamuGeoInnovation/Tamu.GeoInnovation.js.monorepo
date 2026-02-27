import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum CROSS_COUNTRY_PARKING_LAYERS {
  CROSS_COUNTRY_AREA = 'cross-country-parking-area',
  PARKING_LOTS = 'cross-country-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/CrossCountryParking/MapServer';

export const CrossCountryParkingDefinitions = {
  CROSS_COUNTRY_AREA: {
    id: CROSS_COUNTRY_PARKING_LAYERS.CROSS_COUNTRY_AREA,
    layerId: CROSS_COUNTRY_PARKING_LAYERS.CROSS_COUNTRY_AREA,
    name: 'Cross Country Area',
    url: `${eventUrl}/0`
  },
  PARKING: {
    id: CROSS_COUNTRY_PARKING_LAYERS.PARKING_LOTS,
    layerId: CROSS_COUNTRY_PARKING_LAYERS.PARKING_LOTS,
    name: 'Cross Country Event Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const CrossCountryParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.id,
    title: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.name,
    url: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Name}',
      description: '{attributes.Type}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: CrossCountryParkingDefinitions.PARKING.id,
    title: CrossCountryParkingDefinitions.PARKING.name,
    url: CrossCountryParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      /**
       * Notes requested from column: XcounN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.XcounN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const CrossCountryParkingConfiguration: EventConfiguration = {
  id: 'cross-country-parking',
  name: 'Cross Country Parking',
  applicationName: 'Cross Country Parking Map',
  shortApplicationName: 'Cross Country Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M cross country events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const CrossCountryParkingOptions: SpecialEventOptions = [];

export const CrossCountryParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: CrossCountryParkingConfiguration,
  options: CrossCountryParkingOptions,
  sources: CrossCountryParkingColdLayerSources,
  references: CROSS_COUNTRY_PARKING_LAYERS,
  discover: {
    id: CrossCountryParkingConfiguration.id,
    name: CrossCountryParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M cross country events.',
    source: 'internal',
    type: 'parking',
    keywords: ['cross country', 'parking']
  }
};
