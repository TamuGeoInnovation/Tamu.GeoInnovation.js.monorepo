import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { createAthleticsSymbol } from './athletics-symbols.definitions';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum OUTDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'outdoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'outdoor-track-parking-accessible-parking',
  PARKING_LOTS = 'outdoor-track-parking-lots',
  SAFETY_FIRST = 'outdoor-track-parking-safety-first'
}

const eventUrl = Connections.outdoorTrackParkingUrl;

/**
 * The hosted views expose a campus-wide symbol table and the campus-wide street striping table,
 * so every layer sourced from them has to be narrowed down to this event on the client.
 */
const accessibleParkingSymbol = createAthleticsSymbol('ACCESSIBLE_PARKING');

const crosswalkSymbol = {
  type: 'simple-line',
  color: [214, 170, 81, 255],
  width: 2,
  style: 'short-dash'
} as unknown as esri.SymbolProperties;

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
      name: 'Visitor Permit Kiosk'
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
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'TrackOutdoor'`,
      renderer: {
        type: 'simple',
        label: 'Accessible Parking Spaces',
        symbol: accessibleParkingSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.PARKING.id,
    title: OutdoorTrackParkingDefinitions.PARKING.name,
    url: OutdoorTrackParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      /**
       * Notes requested from column: OutdoorN
       */
      description: {
        field: 'outdoorn',
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
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.SAFETY_FIRST.id,
    title: OutdoorTrackParkingDefinitions.SAFETY_FIRST.name,
    url: OutdoorTrackParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    layerIndex: 20,
    native: {
      outFields: ['*'],
      popupEnabled: false,
      definitionExpression: `street_use = 'X-Walk'`,
      renderer: {
        type: 'simple',
        label: 'Please use marked crosswalks. No mid-street crossing.',
        symbol: crosswalkSymbol
      }
    }
  } as unknown as LayerSource
];

export const OutdoorTrackParkingConfiguration: EventConfiguration = {
  id: 'outdoor-track-parking',
  name: 'Outdoor Track',
  applicationName: 'Outdoor Track Parking',
  shortApplicationName: 'Outdoor Track Parking',
  introductionText: 'Parking and transportation information for Texas A&M outdoor track events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/track-and-field/schedule',
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
