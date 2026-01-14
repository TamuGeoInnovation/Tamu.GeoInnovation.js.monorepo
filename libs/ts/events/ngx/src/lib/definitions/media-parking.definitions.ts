import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MEDIA_PARKING_LAYERS {
  LOT_SPECIFIC = 'Lot Specific Permit Required',
  MEDIA_AND_MEDIA_PLUS = 'Media Permit and Media+ Permit Authorized',
  MEDIA_PLUS_ONLY = 'Only Media+ Permit Authorized'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const MediaParkingDefinitions = {
  LOT_SPECIFIC: {
    id: MEDIA_PARKING_LAYERS.LOT_SPECIFIC,
    layerId: MEDIA_PARKING_LAYERS.LOT_SPECIFIC,
    name: 'Lot Specific Permit Required',
    url: `${eventUrl}/12`
  },
  MEDIA_AND_MEDIA_PLUS: {
    id: MEDIA_PARKING_LAYERS.MEDIA_AND_MEDIA_PLUS,
    layerId: MEDIA_PARKING_LAYERS.MEDIA_AND_MEDIA_PLUS,
    name: 'Media Permit and Media+ Permit Authorized',
    url: `${eventUrl}/12`
  },
  MEDIA_PLUS_ONLY: {
    id: MEDIA_PARKING_LAYERS.MEDIA_PLUS_ONLY,
    layerId: MEDIA_PARKING_LAYERS.MEDIA_PLUS_ONLY,
    name: 'Only Media+ Permit Authorized',
    url: `${eventUrl}/12`
  }
};

export const MediaParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MediaParkingDefinitions.MEDIA_AND_MEDIA_PLUS.id,
    title: MediaParkingDefinitions.MEDIA_AND_MEDIA_PLUS.name,
    url: MediaParkingDefinitions.MEDIA_AND_MEDIA_PLUS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: '*',
      definitionExpression: `"GIS.TS.Lot_Use.Media_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Surface')`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [90, 0, 0, 255],
          outline: null
        }
      }
    } as any
  },
  {
    type: 'feature',
    id: MediaParkingDefinitions.MEDIA_PLUS_ONLY.id,
    title: MediaParkingDefinitions.MEDIA_PLUS_ONLY.name,
    url: MediaParkingDefinitions.MEDIA_PLUS_ONLY.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: '*',
      definitionExpression: `"GIS.TS.Lot_Use.Media_Lot" = 1 AND "GIS.TS.ParkingLots.LotType" IN ('Garage Visitor')`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [232, 190, 255, 255],
          outline: null
        }
      }
    } as any
  },
  {
    type: 'feature',
    id: MediaParkingDefinitions.LOT_SPECIFIC.id,
    title: MediaParkingDefinitions.LOT_SPECIFIC.name,
    url: MediaParkingDefinitions.LOT_SPECIFIC.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: '*',
      definitionExpression: `"GIS.TS.Lot_Use.Media_Lot" <> 1 OR "GIS.TS.Lot_Use.Media_Lot" IS NULL OR "GIS.TS.ParkingLots.LotType" NOT IN ('Surface', 'Garage Visitor') OR "GIS.TS.ParkingLots.LotType" IS NULL`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [204, 204, 204, 255],
          outline: null
        }
      }
    } as any
  }
];

export const MediaParkingConfiguration: EventConfiguration = {
  id: 'media-parking',
  name: 'Media Parking',
  applicationName: 'Media Parking Transportation Map',
  shortApplicationName: 'Media Parking Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
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
    description: 'Parking lot information for Media permits.',
    source: 'internal',
    type: 'event',
    keywords: ['media', 'media+', 'parking', 'permit']
  }
};
