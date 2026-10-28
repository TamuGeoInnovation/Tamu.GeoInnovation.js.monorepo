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

// The order the map draws its layers in, top first (#2059): `EventService` adds them to the map in the
// reverse of this order, each above the last. Accessible Parking comes before the lots because both accessible
// spaces sit inside lots (100g and 100j), so with the lots above them their fill would cover the wheelchair
// symbols. `layer-order.spec.ts` checks it on the live map (#2507).
export enum INDOOR_TRACK_PARKING_LAYERS {
  ACCESSIBLE_PARKING = 'indoor-track-parking-accessible-parking',
  PARKING_LOTS = 'indoor-track-parking-lots',
  BUILDING = 'indoor-track-parking-building',
}

const eventUrl = Connections.indoorTrackParkingUrl;

export const IndoorTrackParkingDefinitions = {
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
  }
};

export const IndoorTrackParkingColdLayerSources: LayerSource[] = [
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
  ).map((source) =>
    athleticsDevelopmentSource({
      id: (source as { id: string }).id,
      url: `${eventUrl}/${indoorTrackParkingDevelopmentIndex[(source as { id: string }).id]}`
    })
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
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: IndoorTrackParking_DevelopmentLayerSources,
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
