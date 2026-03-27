import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

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

const crossCountryAreaRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-line',
    color: [137, 112, 68, 255],
    width: 1.5
  }
};

const crossCountryParkingRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.SPEV_Lot_Use.TrackXC',
  uniqueValueInfos: [
    {
      value: 'EventParking',
      label: 'Event Parking',
      symbol: {
        type: 'simple-fill',
        color: [123, 35, 42, 255],
        outline: null
      } as unknown as esri.SymbolProperties
    }
  ]
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
    layerIndex: 59,
    native: {
      outFields: ['*'],
      renderer: crossCountryAreaRenderer
    } as unknown as FeatureNative
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
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.XcounN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    native: {
      definitionExpression: `GIS.TS.SPEV_Lot_Use.TrackXC = 'EventParking'`,
      outFields: ['*'],
      renderer: crossCountryParkingRenderer
    } as unknown as FeatureNative
  }
];

export const CrossCountryParkingConfiguration: EventConfiguration = {
  id: 'cross-country-parking',
  name: 'Cross Country Map',
  applicationName: 'Cross Country Parking Map',
  shortApplicationName: 'Cross Country Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M cross country events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.36925, 30.61689]
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
    mapType: 'athletics',
    keywords: ['cross country', 'parking']
  }
};
