import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

// The order the map draws its layers in, top first (#2059): `EventService` adds them to the map in the
// reverse of this order, each above the last. Team Bus Parking comes before Indoor Track Building because
// the team bus area is the building's own footprint, so with the building above it the area is drawn and
// then completely covered, and switching it on or off changes nothing on the map (#1993).
export enum INDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'indoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'indoor-track-parking-accessible-parking',
  PARKING_LOTS = 'indoor-track-parking-lots',
  TEAM_BUS_PARKING = 'indoor-track-parking-team-bus',
  BUILDING = 'indoor-track-parking-building',
  SAFETY_FIRST = 'indoor-track-parking-safety-first'
}

const eventUrl = Connections.indoorTrackParkingUrl;

export const IndoorTrackParkingDefinitions = {
  VISITOR_KIOSK: {
    id: INDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: INDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    layerId: INDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    name: 'Indoor Track Event Parking Lots',
    url: `${eventUrl}/2`
  },
  BUILDING: {
    id: INDOOR_TRACK_PARKING_LAYERS.BUILDING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.BUILDING,
    name: 'Indoor Track Building',
    url: `${eventUrl}/3`
  },
  SAFETY_FIRST: {
    id: INDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    layerId: INDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/4`
  },
  TEAM_BUS_PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.TEAM_BUS_PARKING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.TEAM_BUS_PARKING,
    name: 'Team Bus Parking',
    url: `${eventUrl}/5`
  }
};

export const IndoorTrackParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.VISITOR_KIOSK.id,
    title: IndoorTrackParkingDefinitions.VISITOR_KIOSK.name,
    url: IndoorTrackParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    // Overridden (#1992): the service's renderer, copied from Soccer and Softball's, gives its wheelchair
    // symbol only to `Disabled,Soccer` and `Disabled,Softball`, so none of the `Disabled,TrackIndoor`
    // spaces was drawn and the legend entry was empty. Every space the expression below selects is drawn
    // with the service's own symbol. Remove once the service's renderer names `TrackIndoor`.
    symbolFromServiceClass: 'Accessible Parking',
    native: {
      outFields: ['*'],
      // The view holds every event's points, of every kind; only the accessible spaces belong here, and
      // with one symbol for all of them nothing else may be selected.
      definitionExpression: `event = 'TrackIndoor' AND type IN ('Accessible', 'Disabled')`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.PARKING.id,
    url: IndoorTrackParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      /**
       * Notes requested from column: IndoorN
       */
      description: {
        field: 'indoorn',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.BUILDING.id,
    url: IndoorTrackParkingDefinitions.BUILDING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: IndoorTrackParkingDefinitions.BUILDING.name,
      description: '{attributes.sp_sh_notes}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.SAFETY_FIRST.id,
    title: IndoorTrackParkingDefinitions.SAFETY_FIRST.name,
    url: IndoorTrackParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      popupEnabled: false,
      definitionExpression: `street_use = 'X-Walk'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.id,
    url: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.name,
      description: '{attributes.sp_sh_notes}'
    },
    visible: true,
    listMode: 'show',
    // Overridden (#1993): the service's renderer has symbols for `Team Drop Off` and `Team Bus Parking`,
    // but the layer's one area is type `SPORTS`, so it was not drawn. The layer is the team bus parking,
    // so it is drawn with the service's `Team Bus Parking` symbol. A drop-off area added later would be
    // drawn the same way. Remove once the service's renderer and data agree.
    symbolFromServiceClass: 'Team Bus Parking',
    native: {
      outFields: ['*']
    }
  }
];

/**
 * Indoor Track on the development GIS server (#2143).
 *
 * Three layers: Accessible Parking Spaces, the Indoor Track Building and the event lots. The visitor
 * kiosk and the crosswalk ("Safety First") layers were removed, as on every other athletics map.
 *
 * **Team Bus Parking is deliberately absent.** It was added to the production map in #2059, and it is
 * not in the development view - the GIS team confirmed on 23 October 2026 that the development layers
 * are as they intend. Do not "restore" it here: adding a layer this service does not publish gives a
 * map that fails to draw rather than one that draws more.
 *
 * Derived from the production sources so the popups, definition expressions and draw order cannot
 * drift from them; only the layer indexes move.
 */
const indoorTrackParkingDevelopmentIndex: Record<string, number> = {
  [IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.id]: 0,
  [IndoorTrackParkingDefinitions.BUILDING.id]: 1,
  [IndoorTrackParkingDefinitions.PARKING.id]: 2
};

export const IndoorTrackParking_DevelopmentLayerSources: LayerSource[] =
  IndoorTrackParkingColdLayerSources.filter(
    (source) => (source as { id: string }).id in indoorTrackParkingDevelopmentIndex
  ).map(
    (source) =>
      ({
        ...source,
        url: `${eventUrl}/${indoorTrackParkingDevelopmentIndex[(source as { id: string }).id]}`
      }) as unknown as LayerSource
  );

export const IndoorTrackParkingConfiguration: EventConfiguration = {
  id: 'indoor-track-parking',
  name: 'Indoor Track',
  applicationName: 'Indoor Track Parking',
  shortApplicationName: 'Indoor Track Parking',
  introductionText: 'Parking and transportation information for Texas A&M indoor track events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/track-and-field/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const IndoorTrackParkingOptions: SpecialEventOptions = [];

export const IndoorTrackParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: IndoorTrackParkingConfiguration,
  options: IndoorTrackParkingOptions,
  sources: IndoorTrackParkingColdLayerSources,
  developmentSources: IndoorTrackParking_DevelopmentLayerSources,
  references: INDOOR_TRACK_PARKING_LAYERS,
  discover: {
    id: IndoorTrackParkingConfiguration.id,
    name: IndoorTrackParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M indoor track events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['indoor track', 'parking', 'visitor', 'accessible', 'crosswalk', 'team bus']
  }
};
