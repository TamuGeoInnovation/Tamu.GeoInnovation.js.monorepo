import { LayerSource } from '@tamu-gisc/common/types';

import { athleticsDevelopmentSource } from './common.definitions';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum WOMENS_BASKETBALL_LAYERS {
  ACCESSIBLE_PARKING = 'womens-basketball-accessible-parking',
  PARKING_LOTS = 'womens-basketball-parking-lots'
}

/**
 * The map's new version, published so far only on the development GIS server (#2001): Accessible Parking
 * Spaces and Women's Basketball Event Parking Lots, and nothing else. Transportation Services dropped the
 * hourly visitor parking kiosks and the Safety First crosswalks from it. Titles, symbols and order are the
 * service's own.
 *
 * Drawn everywhere as of #2465: the production services are being republished to match, so these are the
 * map's only sources and the hourly visitor parking kiosks and Safety First crosswalks go with the old
 * ones.
 */
// The hosted view is reached through the ordinary connection, which `athleticsHost` resolves to the
// development host; Accessible Parking Spaces is 0 and the event lots are 1 on both.
const parkingUrl = Connections.womensBasketballUrl;

export const WomensBasketball_DevelopmentLayerSources: LayerSource[] = [
  athleticsDevelopmentSource({
    id: WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
    url: `${parkingUrl}/0`
  }),
  athleticsDevelopmentSource({
    id: WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
    url: `${parkingUrl}/1`
  })
];

export const WomensBasketball_Configuration: EventConfiguration = {
  id: 'womens-basketball',
  name: "Women's Basketball",
  applicationName: "Women's Basketball Parking",
  shortApplicationName: "Women's Basketball Parking",
  eventDates: [
    '2026-11-02',
    '2026-11-05',
    '2026-11-07',
    '2026-11-16',
    '2026-11-18',
    '2026-11-21',
    '2026-12-06',
    '2026-12-15',
    '2026-12-17',
    '2026-12-22',
    '2026-12-31',
    '2027-01-10',
    '2027-01-21',
    '2027-01-28',
    '2027-01-31',
    '2027-02-07',
    '2027-02-22',
    '2027-02-25'
  ],
  scheduleUrl: 'https://12thman.com/sports/womens-basketball/schedule',
  zoom: 16,
  mapCenter: [-96.34467, 30.60585]
};

export const WomensBasketball_Options: SpecialEventOptions = [];

export const WomensBasketball_Ts: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: WomensBasketball_Configuration,
  options: WomensBasketball_Options,
  // One schema everywhere (#2453, #2465). The athletics services are being republished so that
  // production carries what development already does, and the old production columns are abandoned.
  // This was the last of the ten sports still forked.
  sources: WomensBasketball_DevelopmentLayerSources,
  references: WOMENS_BASKETBALL_LAYERS,
  discover: {
    id: WomensBasketball_Configuration.id,
    name: WomensBasketball_Configuration.name,
    description: "Transportation and parking information for Women's Basketball events.",
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['bike', 'womens-basketball', 'cycling', 'parking', 'transportation']
  }
};
