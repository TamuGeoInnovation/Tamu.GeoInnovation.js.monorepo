import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

export enum OUTDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'outdoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'outdoor-track-parking-accessible-parking',
  PARKING_LOTS = 'outdoor-track-parking-lots',
  SAFETY_FIRST = 'outdoor-track-parking-safety-first'
}

const eventUrl = Connections.outdoorTrackParkingUrl;

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
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 22,
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'TrackOutdoor'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: OutdoorTrackParkingDefinitions.PARKING.id,
    url: OutdoorTrackParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
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
      definitionExpression: `street_use = 'X-Walk'`
    }
  } as unknown as LayerSource
];

/**
 * Outdoor Track on the development GIS server (#2143).
 *
 * The GIS team republished this map as a hosted view with **two** layers, having removed the visitor
 * kiosk and the crosswalk ("Safety First") layers and renamed the accessible one. Production still
 * serves the four-layer version until they publish there, so this stands beside the sources above
 * rather than replacing them; `event-settings.service.ts` chooses between them.
 *
 * **Derived from the production sources rather than written out again**, so the two cannot drift: the
 * popups, definition expressions and draw order are the same objects, and only the layer index moves.
 * `eventUrl` already resolves to the development host, because `athleticsHost` in `connections.ts` does.
 *
 * The view's own indexes: Accessible Parking Spaces is 0 here and 1 on production, the lots 1 here and 2.
 */
const outdoorTrackParkingDevelopmentIndex: Record<string, number> = {
  [OutdoorTrackParkingDefinitions.ACCESSIBLE_PARKING.id]: 0,
  [OutdoorTrackParkingDefinitions.PARKING.id]: 1
};

export const OutdoorTrackParking_DevelopmentLayerSources: LayerSource[] = OutdoorTrackParkingColdLayerSources.filter(
  (source) => (source as { id: string }).id in outdoorTrackParkingDevelopmentIndex
).map(
  (source) =>
    ({
      ...source,
      url: `${eventUrl}/${outdoorTrackParkingDevelopmentIndex[(source as { id: string }).id]}`
    }) as unknown as LayerSource
);

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
  developmentSources: OutdoorTrackParking_DevelopmentLayerSources,
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
