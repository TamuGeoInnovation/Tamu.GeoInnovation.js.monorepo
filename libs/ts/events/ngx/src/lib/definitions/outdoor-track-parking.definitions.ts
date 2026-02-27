import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum OUTDOOR_TRACK_PARKING_LAYERS {
  PARKING_LOTS = 'outdoor-track-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/OutdoorTrackParking/MapServer';

export const OutdoorTrackParkingDefinitions = {
  PARKING: {
    id: OUTDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    layerId: OUTDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    name: 'Outdoor Track Event Parking Lots',
    url: `${eventUrl}/2`
  }
};

export const OutdoorTrackParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.PARKING.id,
    title: OutdoorTrackParkingDefinitions.PARKING.name,
    url: OutdoorTrackParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      /**
       * Notes requested from column: OutdoorN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.OutdoorN',
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

export const OutdoorTrackParkingConfiguration: EventConfiguration = {
  id: 'outdoor-track-parking',
  name: 'Outdoor Track Parking',
  applicationName: 'Outdoor Track Parking Map',
  shortApplicationName: 'Outdoor Track Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M outdoor track events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const OutdoorTrackParkingOptions: SpecialEventOptions = [];

export const OutdoorTrackParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: OutdoorTrackParkingConfiguration,
  options: OutdoorTrackParkingOptions,
  sources: OutdoorTrackParkingColdLayerSources,
  references: OUTDOOR_TRACK_PARKING_LAYERS,
  discover: {
    id: OutdoorTrackParkingConfiguration.id,
    name: OutdoorTrackParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M outdoor track events.',
    source: 'internal',
    type: 'parking',
    keywords: ['outdoor track', 'parking']
  }
};
