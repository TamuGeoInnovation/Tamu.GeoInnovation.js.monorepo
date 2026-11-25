import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { athleticsDevelopmentSource } from './common.definitions';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

/**
 * The NCAA Volleyball 1st & 2nd Round map (#2713), for 4 and 5 December 2026 if Texas A&M hosts.
 *
 * A map of its own, not the Volleyball map: that one reads `VolleyballParking_view` for the season, and this
 * tournament has its own service. Whether A&M hosts is announced on 29 November, so the map waits on dev
 * until then.
 *
 * The service is a marker feed like the other athletics views, so each layer is an `athleticsDevelopmentSource`:
 * `name` and `description` make the popup. Titles, symbols and drawing order are the service's own
 * (`docs/map-layers.md`). The order below is the service's, top first.
 */
export enum NCAA_VOLLEYBALL_LAYERS {
  ACCESSIBLE_PARKING = 'ncaa-volleyball-accessible-parking',
  PARKING_LOTS = 'ncaa-volleyball-parking-lots'
}

const serviceUrl = Connections.ncaaVolleyballUrl;

export const NcaaVolleyballLayerSources: LayerSource[] = [
  athleticsDevelopmentSource({ id: NCAA_VOLLEYBALL_LAYERS.ACCESSIBLE_PARKING, url: `${serviceUrl}/0` }),
  athleticsDevelopmentSource({ id: NCAA_VOLLEYBALL_LAYERS.PARKING_LOTS, url: `${serviceUrl}/1` })
];

export const NcaaVolleyballConfiguration: EventConfiguration = {
  id: 'ncaa-volleyball',
  name: 'NCAA Volleyball 1st & 2nd Round',
  applicationName: 'NCAA Volleyball 1st & 2nd Round Parking',
  shortApplicationName: 'NCAA Volleyball Parking',
  introductionText: 'Parking for the NCAA Volleyball 1st & 2nd Round at Texas A&M.',
  eventDates: ['2026-12-04', '2026-12-05'],
  scheduleUrl: 'https://12thman.com/sports/volleyball/schedule',
  // The centre of the lots' extent (WGS84), about 600 m across.
  mapCenter: [-96.3465, 30.60562],
  zoom: 16
};

export const NcaaVolleyballOptions: SpecialEventOptions = [];

export const NcaaVolleyballTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: NcaaVolleyballConfiguration,
  options: NcaaVolleyballOptions,
  sources: NcaaVolleyballLayerSources,
  references: NCAA_VOLLEYBALL_LAYERS,
  developmentOnly:
    '#2713: published on the development GIS server only; it goes to production if Texas A&M hosts (announced 29 November)',
  discover: {
    id: NcaaVolleyballConfiguration.id,
    name: NcaaVolleyballConfiguration.name,
    description: 'Parking for the NCAA Volleyball 1st & 2nd Round at Texas A&M, 4 and 5 December.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['ncaa', 'volleyball', 'tournament', 'first round', 'second round', 'parking', 'accessible']
  }
};
