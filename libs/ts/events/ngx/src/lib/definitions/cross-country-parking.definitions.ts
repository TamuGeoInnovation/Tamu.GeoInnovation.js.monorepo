import { LayerSource } from '@tamu-gisc/common/types';

import { athleticsDevelopmentSource } from './common.definitions';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

export enum CROSS_COUNTRY_PARKING_LAYERS {
  CROSS_COUNTRY_AREA = 'cross-country-parking-area',
  PARKING_LOTS = 'cross-country-parking-lots'
}

const eventUrl = Connections.crossCountryParkingUrl;

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
    url: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: CrossCountryParkingDefinitions.PARKING.id,
    url: CrossCountryParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'xcounn',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      definitionExpression: `trackxc = 'EventParking'`,
      outFields: ['*']
    } as unknown as FeatureNative
  }
];

export const CrossCountryParkingConfiguration: EventConfiguration = {
  id: 'cross-country-parking',
  name: 'Cross Country',
  applicationName: 'Cross Country Parking',
  shortApplicationName: 'Cross Country Parking',
  introductionText: 'Parking and transportation information for Texas A&M cross country events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/cross-country/schedule',
  zoom: 16,
  mapCenter: [-96.36925, 30.61689]
};

export const CrossCountryParkingOptions: SpecialEventOptions = [];

/**
 * Cross country on the development server (#2209). Same indexes as production; the lots layer's
 * `trackxc = 'EventParking'` becomes `type`, which is what the new schema carries.
 */
export const CrossCountryParking_DevelopmentLayerSources: LayerSource[] = [
  athleticsDevelopmentSource({
    id: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.id,
    url: CrossCountryParkingDefinitions.CROSS_COUNTRY_AREA.url
  }),
  athleticsDevelopmentSource({
    id: CrossCountryParkingDefinitions.PARKING.id,
    url: CrossCountryParkingDefinitions.PARKING.url,
    onlyType: 'Event Parking'
  })
];

export const CrossCountryParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: CrossCountryParkingConfiguration,
  options: CrossCountryParkingOptions,
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: CrossCountryParking_DevelopmentLayerSources,
  references: CROSS_COUNTRY_PARKING_LAYERS,
  discover: {
    id: CrossCountryParkingConfiguration.id,
    name: CrossCountryParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M cross country events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['cross country', 'parking']
  }
};
