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

export enum VOLLEYBALL_PARKING_LAYERS {
  ACCESSIBLE_PARKING = 'volleyball-parking-accessible-parking',
  PARKING_LOTS = 'volleyball-parking-lots',
}

const eventUrl = Connections.volleyballParkingUrl;

export const VolleyballParkingDefinitions = {
  ACCESSIBLE_PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    layerId: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    name: 'Volleyball Event Parking Lots',
    url: `${eventUrl}/2`
  }
};

export const VolleyballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Volleyball'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.PARKING.id,
    url: VolleyballParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'volelyballn',
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
 * Volleyball on the development GIS server (#2143).
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
const volleyballParkingDevelopmentIndex: Record<string, number> = {
  [VolleyballParkingDefinitions.ACCESSIBLE_PARKING.id]: 0,
  [VolleyballParkingDefinitions.PARKING.id]: 1
};

export const VolleyballParking_DevelopmentLayerSources: LayerSource[] = VolleyballParkingColdLayerSources.filter(
  (source) => (source as { id: string }).id in volleyballParkingDevelopmentIndex
).map((source) =>
  athleticsDevelopmentSource({
    id: (source as { id: string }).id,
    url: `${eventUrl}/${volleyballParkingDevelopmentIndex[(source as { id: string }).id]}`
  })
);

export const VolleyballParkingConfiguration: EventConfiguration = {
  id: 'volleyball-parking',
  name: 'Volleyball',
  applicationName: 'Volleyball Parking',
  shortApplicationName: 'Volleyball Parking',
  introductionText: 'Parking and transportation information for Texas A&M volleyball events.',
  eventDates: [
    '2026-08-11',
    '2026-08-28',
    '2026-08-29',
    '2026-09-11',
    '2026-09-15',
    '2026-09-22',
    '2026-09-27',
    '2026-10-02',
    '2026-10-04',
    '2026-10-16',
    '2026-10-18',
    '2026-10-30',
    '2026-11-13',
    '2026-11-15'
  ],
  scheduleUrl: 'https://12thman.com/sports/volleyball/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const VolleyballParkingOptions: SpecialEventOptions = [];

const VolleyballParkingLayerReferences: Record<string, string> = {
  ACCESSIBLE_PARKING: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
  PARKING_LOTS: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS
};

export const VolleyballParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: VolleyballParkingConfiguration,
  options: VolleyballParkingOptions,
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: VolleyballParking_DevelopmentLayerSources,
  references: VolleyballParkingLayerReferences,
  discover: {
    id: VolleyballParkingConfiguration.id,
    name: VolleyballParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M volleyball events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['volleyball', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
