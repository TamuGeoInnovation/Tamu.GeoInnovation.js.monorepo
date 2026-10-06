import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum KICKOFF_150TH_LAYERS {
  EVENT_LOCATIONS = '150th-kickoff-event-locations',
  SHUTTLE_ROUTE = '150th-kickoff-shuttle-route',
  PARKING = '150th-kickoff-parking'
}

const eventUrl = Connections.kickoff150thUrl;

export const Kickoff150thDefinitions = {
  EVENT_LOCATIONS: {
    id: KICKOFF_150TH_LAYERS.EVENT_LOCATIONS,
    layerId: KICKOFF_150TH_LAYERS.EVENT_LOCATIONS,
    name: 'Event Locations',
    url: `${eventUrl}/0`
  },
  SHUTTLE_ROUTE: {
    id: KICKOFF_150TH_LAYERS.SHUTTLE_ROUTE,
    layerId: KICKOFF_150TH_LAYERS.SHUTTLE_ROUTE,
    name: 'Shuttle Route',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: KICKOFF_150TH_LAYERS.PARKING,
    layerId: KICKOFF_150TH_LAYERS.PARKING,
    name: 'Parking',
    url: `${eventUrl}/2`
  }
};

export const Kickoff150thLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Kickoff150thDefinitions.EVENT_LOCATIONS.id,
    url: Kickoff150thDefinitions.EVENT_LOCATIONS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    legend: {
      mode: 'renderer-symbol',
      preserveAspectRatio: true,
      fit: 'contain',
      width: 24,
      height: 30
    },
    native: {
      outFields: ['*'],
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: Kickoff150thDefinitions.SHUTTLE_ROUTE.id,
    url: Kickoff150thDefinitions.SHUTTLE_ROUTE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
    }
  },
  {
    type: 'feature',
    id: Kickoff150thDefinitions.PARKING.id,
    url: Kickoff150thDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
    }
  }
];

export const Kickoff150thConfiguration: EventConfiguration = {
  // The route id stays `150th-kickoff` so links already shared for this map keep working, even
  // though the event has since been renamed to the 150th Opening Ceremony.
  id: '150th-kickoff',
  name: '150th Opening Ceremony',
  applicationName: '150th Opening Ceremony Map',
  shortApplicationName: '150th Opening Ceremony',
  eventDates: ['2026-10-02'],
  series: '150th',
  // Centre and zoom derived from the service extent, not chosen by eye. Queried in WGS84 (the service
  // is published in EPSG:32139, Texas State Plane Central, so its native extent is not lon/lat):
  // [-96.34541, 30.60766] .. [-96.33802, 30.61329], about 0.71km across.
  //
  // The previous centre [-96.3368, 30.6212] was set for the outdoor venue and was left behind when the
  // ceremony moved indoors and the service was republished - roughly 1.2km north of the data, which
  // pushed the event marker to the bottom edge of the map.
  zoom: 17,
  mapCenter: [-96.34172, 30.61047],

  // Announced 30 September: the ceremony moved indoors because of the forecast. The toast carries the
  // short version on the main map; the full details are in `notice` below, shown on this event's own
  // map. The icon comes from the `150th` series rather than being named here.
  //
  // Remove both once the event has passed on 2 October.
  toast: {
    id: '150th-kickoff-venue-change',
    // Above the other 2 October event's toast: a venue change is the thing someone needs to know, and
    // without this the two arrive in definition order and the more useful one can end up second.
    priority: 'high',
    title: 'Opening Ceremony moved to Rudder Auditorium',
    message:
      "Due to projected inclement weather in this week's forecast, the Sesquicentennial Opening Ceremony will take place in Rudder Auditorium on Friday, Oct. 2. Click here for parking and shuttle route details.",
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/150th-kickoff'
    }
  },

  notice: {
    title: 'Venue change: Rudder Auditorium',
    message:
      'Because of projected inclement weather, the Sesquicentennial Opening Ceremony will take place in Rudder Auditorium.',
    details: [
      'Friday, October 2, 2026. Program 4 p.m., reception 5 p.m.',
      'Rudder Tower, Auditorium. 401 Joe Routt Blvd, College Station, TX.',
      'Free parking at West Campus Garage. Shuttles run from West Campus Garage to Rudder from 3 p.m.',
      'Yell Practice at 9 p.m. will proceed as planned.'
    ],
    acknowledgeText: 'Got it',
    sessionKey: '150th-kickoff-venue-change'
  }
};

export const Kickoff150thOptions: SpecialEventOptions = [];

export const Kickoff150thTs: AggiemapCustomMapConfiguration = {
  configuration: Kickoff150thConfiguration,
  options: Kickoff150thOptions,
  sources: Kickoff150thLayerSources,
  references: KICKOFF_150TH_LAYERS,
  type: 'special-event',
  discover: {
    id: Kickoff150thConfiguration.id,
    name: Kickoff150thConfiguration.name,
    description: 'Event locations, shuttle route and parking for the 150th Opening Ceremony celebration.',
    source: 'internal',
    type: 'event',
    // Listed on Campus Events and on the 150th Anniversary page. Both, not either:
    // these are campus events that also belong to the anniversary set.
    mapTypes: ['campus', '150'],
    columnKey: 'fall',
    visible: true,
    keywords: ['150', '150th', 'opening', 'ceremony', 'kickoff', 'celebration', 'shuttle', 'parking']
  }
};
