import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum LIVE_AT_THE_STATION_LAYERS {
  PARKING = 'live-at-the-station-parking'
}

const eventUrl = Connections.liveAtTheStationUrl;

const LiveAtTheStationEventDefinitions = {
  LIVE_AT_THE_STATION_PARKING: {
    id: LIVE_AT_THE_STATION_LAYERS.PARKING,
    layerId: LIVE_AT_THE_STATION_LAYERS.PARKING,
    name: 'Live at the Station Parking',
    url: `${eventUrl}/0`
  }
};

export const LiveAtTheStationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: LiveAtTheStationEventDefinitions.LIVE_AT_THE_STATION_PARKING.id,
    title: LiveAtTheStationEventDefinitions.LIVE_AT_THE_STATION_PARKING.name,
    url: LiveAtTheStationEventDefinitions.LIVE_AT_THE_STATION_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    // The service's lots carry `name` (e.g. "Lot 62", "WCG") and `description` (e.g.
    // "$30 Paid Parking/Any Valid Texas A&M Permit"), matching the popup's expected bindings.
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const LiveAtTheStationConfiguration: EventConfiguration = {
  id: 'live-at-the-station',
  name: 'Live at the Station',
  applicationName: 'Live at the Station Transportation Map',
  shortApplicationName: 'Live at the Station Map',
  introductionText: 'Get the best transportation and logistics information for Live at the Station.',
  eventDates: ['2026-11-07'],
  // Centre and zoom derived from the service extent (WGS84): x -96.34978 to -96.33616,
  // y 30.60427 to 30.61259 -- roughly 1.3km across.
  mapCenter: [-96.34297, 30.60843],
  zoom: 15,
  toast: {
    id: 'live-at-the-station-notification',
    title: 'Live at the Station Transportation Map Available',
    message:
      'Attending Live at the Station? Click me to open the Live at the Station Transportation Map to get the best logistics and transportation information!',
    imgUrl: './assets/images/icons/musical.png',
    imgAltText: 'Live at the Station Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/live-at-the-station'
    }
  }
};

export const LiveAtTheStationOptions: SpecialEventOptions = [];

export const LiveAtTheStationTs: AggiemapCustomMapConfiguration = {
  configuration: LiveAtTheStationConfiguration,
  options: LiveAtTheStationOptions,
  sources: LiveAtTheStationColdLayerSources,
  references: LIVE_AT_THE_STATION_LAYERS,
  type: 'special-event',
  discover: {
    id: LiveAtTheStationConfiguration.id,
    name: LiveAtTheStationConfiguration.name,
    description: 'Transportation and logistics information for Live at the Station.',
    source: 'internal',
    // Unlike most one-off event maps, this is left visible: `getUpcomingApplications()` reads
    // `getVisibleInternalDiscoverApplications()`, so a hidden map never reaches the Upcoming Events
    // list on All Maps. #993 asks for this event to be listed there.
    visible: true,
    type: 'event',
    columnKey: 'fall',
    keywords: ['live at the station', 'concert', 'station', 'parking', 'transportation']
  }
};
