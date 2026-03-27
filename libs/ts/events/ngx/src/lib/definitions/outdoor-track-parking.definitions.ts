import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';


export enum OUTDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'outdoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'outdoor-track-parking-accessible-parking',
  PARKING_LOTS = 'outdoor-track-parking-lots',
  SAFETY_FIRST = 'outdoor-track-parking-safety-first'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/OutdoorTrackParking/MapServer';

export const OutdoorTrackParkingDefinitions = {
  VISITOR_KIOSK: {
    id: OUTDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: OUTDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: OUTDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: OUTDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: OUTDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    layerId: OUTDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    name: 'Outdoor Track Event Parking Lots',
    url: `${eventUrl}/2`
  },
  SAFETY_FIRST: {
    id: OUTDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    layerId: OUTDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const OutdoorTrackParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.VISITOR_KIOSK.id,
    title: OutdoorTrackParkingDefinitions.VISITOR_KIOSK.name,
    url: OutdoorTrackParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
    },
    visible: true,
    listMode: 'show',
    layerIndex: 23,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: OutdoorTrackParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: OutdoorTrackParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 22,
  },
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
    layerIndex: 21,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'map-image',
    id: OutdoorTrackParkingDefinitions.SAFETY_FIRST.id,
    title: OutdoorTrackParkingDefinitions.SAFETY_FIRST.name,
    url: eventUrl,
    visible: true,
    listMode: 'show',
    layerIndex: 20,
    native: {
      listMode: 'hide-children',
      sublayers: [
        {
          id: 3,
          title: OutdoorTrackParkingDefinitions.SAFETY_FIRST.name,
          visible: true,
          popupEnabled: false
        } as unknown as __esri.SublayerProperties
      ]
    } as unknown as __esri.MapImageLayerProperties
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
    mapType: 'athletics',
    keywords: ['outdoor track', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
