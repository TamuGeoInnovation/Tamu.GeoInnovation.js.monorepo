import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';
import { athleticsDevelopmentSource } from './common.definitions';

export enum SOCCER_PARKING_LAYERS {
  ACCESSIBLE_PARKING = 'soccer-parking-accessible-parking',
  PARKING_LOTS = 'soccer-parking-lots',
}

const eventUrl = Connections.soccerParkingUrl;

export const SoccerParkingDefinitions = {
  PARKING: {
    id: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    layerId: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    name: 'Soccer Event Parking Lots',
    url: `${eventUrl}/2`
  },
  ACCESSIBLE_PARKING: {
    id: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  }
};

export const SoccerParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SoccerParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoccerParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SoccerParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Soccer'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.PARKING.id,
    url: SoccerParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'soccern',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
];

/**
 * Soccer on the development GIS server (#2143).
 *
 * The GIS team republished this map as a hosted view with **two** layers - Accessible Parking Spaces
 * and the event lots - having removed the visitor kiosk and the crosswalk ("Safety First") layers.
 * Production still serves the four-layer version, so this stands beside `SoccerParkingColdLayerSources`
 * rather than replacing it; `event-settings.service.ts` chooses between them.
 *
 * `eventUrl` already resolves to the development host, because `athleticsHost` in `connections.ts` does
 * - so only the layer indexes are restated here. They are the view's own and bear no relation to
 * production's: Accessible Parking Spaces is 0 here and 1 there.
 *
 * Everything other than the url and the index is deliberately identical to the production source above
 * - the same ids, popups, definition expressions and draw order - so that what a visitor sees on
 * development differs only by the two layers the GIS team removed.
 */
export const SoccerParking_DevelopmentLayerSources: LayerSource[] = [
  athleticsDevelopmentSource({
    id: SoccerParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoccerParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: `${eventUrl}/0`
  }),
  athleticsDevelopmentSource({
    id: SoccerParkingDefinitions.PARKING.id,
    url: `${eventUrl}/1`
  })
];

export const SoccerParkingConfiguration: EventConfiguration = {
  id: 'soccer-parking',
  name: 'Soccer',
  applicationName: 'Soccer Parking',
  shortApplicationName: 'Soccer Parking',
  introductionText: 'Parking and transportation information for Texas A&M soccer events.',
  eventDates: [
    '2026-08-05',
    '2026-08-22',
    '2026-08-27',
    '2026-09-03',
    '2026-09-06',
    '2026-09-24',
    '2026-09-27',
    '2026-10-15',
    '2026-10-18',
    '2026-11-01'
  ],
  scheduleUrl: 'https://12thman.com/sports/soccer/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SoccerParkingOptions: SpecialEventOptions = [];

const SoccerParkingLayerReferences: Record<string, string> = {
  ACCESSIBLE_PARKING: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
  PARKING_LOTS: SOCCER_PARKING_LAYERS.PARKING_LOTS
};

export const SoccerParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SoccerParkingConfiguration,
  options: SoccerParkingOptions,
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: SoccerParking_DevelopmentLayerSources,
  references: SoccerParkingLayerReferences,
  discover: {
    id: SoccerParkingConfiguration.id,
    name: SoccerParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M soccer events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['soccer', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
