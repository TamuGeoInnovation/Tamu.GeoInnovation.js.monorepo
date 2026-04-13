import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum TENNIS_PARKING_LAYERS {
  PARKING_LOTS = 'tennis-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/TennisParking/MapServer';

export const TennisParkingDefinitions = {
  PARKING: {
    id: TENNIS_PARKING_LAYERS.PARKING_LOTS,
    layerId: TENNIS_PARKING_LAYERS.PARKING_LOTS,
    name: 'Tennis Event Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const TennisParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TennisParkingDefinitions.PARKING.id,
    title: TennisParkingDefinitions.PARKING.name,
    url: TennisParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      /**
       * Notes requested from column: TennisN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.TennisN',
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

export const TennisParkingConfiguration: EventConfiguration = {
  id: 'tennis-parking',
  name: 'Tennis Map',
  applicationName: 'Tennis Parking Map',
  shortApplicationName: 'Tennis Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M tennis events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/mens-tennis/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const TennisParkingOptions: SpecialEventOptions = [];

export const TennisParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TennisParkingConfiguration,
  options: TennisParkingOptions,
  sources: TennisParkingColdLayerSources,
  references: TENNIS_PARKING_LAYERS,
  discover: {
    id: TennisParkingConfiguration.id,
    name: TennisParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M tennis events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['tennis', 'parking']
  }
};
