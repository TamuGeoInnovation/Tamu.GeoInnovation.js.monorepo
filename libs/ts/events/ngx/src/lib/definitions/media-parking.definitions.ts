import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MEDIA_PARKING_LAYERS {
  MEDIA_PARKING_LOTS = 'media-parking-lots',
  CONSTRUCTION = 'construction'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const MediaParkingDefinitions = {
  MEDIA_PARKING_LOTS: {
    id: MEDIA_PARKING_LAYERS.MEDIA_PARKING_LOTS,
    layerId: MEDIA_PARKING_LAYERS.MEDIA_PARKING_LOTS,
    name: 'Media Parking Lots',
    url: `${eventUrl}/12`
  },
  CONSTRUCTION: {
    id: MEDIA_PARKING_LAYERS.CONSTRUCTION,
    layerId: MEDIA_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  }
};

export const MediaParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MediaParkingDefinitions.MEDIA_PARKING_LOTS.id,
    title: MediaParkingDefinitions.MEDIA_PARKING_LOTS.name,
    url: MediaParkingDefinitions.MEDIA_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MediaParkingDefinitions.CONSTRUCTION.id,
    title: MediaParkingDefinitions.CONSTRUCTION.name,
    url: MediaParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const MediaParkingConfiguration: EventConfiguration = {
  id: 'media-parking',
  name: 'Media Parking',
  applicationName: 'Media Parking Map',
  shortApplicationName: 'Media Parking Map',
  introductionText: 'Parking map for media permits.',
  eventDates: [],
  mapCenter: [-96.34731, 30.60543],
  zoom: 16
};

export const MediaParkingOptions: SpecialEventOptions = [];

export const MediaParkingTs: ISpecialEventRoot = {
  configuration: MediaParkingConfiguration,
  options: MediaParkingOptions,
  sources: MediaParkingColdLayerSources,
  references: MEDIA_PARKING_LAYERS,
  discover: {
    id: MediaParkingConfiguration.id,
    name: MediaParkingConfiguration.name,
    description: 'Parking lot information for media permits.',
    source: 'internal',
    type: 'event',
    keywords: ['media', 'parking', 'permit']
  }
};
