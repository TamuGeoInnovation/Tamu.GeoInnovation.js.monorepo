import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum KICKOFF_AT_KYLE_LAYERS {
  PARKING = 'kickoff-at-kyle-parking'
}

const eventUrl = Connections.kickoffAtKyleUrl;

const KickoffAtKyleEventDefinitions = {
  KICKOFF_AT_KYLE_PARKING: {
    id: KICKOFF_AT_KYLE_LAYERS.PARKING,
    layerId: KICKOFF_AT_KYLE_LAYERS.PARKING,
    name: 'Kickoff at Kyle Parking',
    url: `${eventUrl}/0`
  }
};

export const KickoffAtKyleColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: KickoffAtKyleEventDefinitions.KICKOFF_AT_KYLE_PARKING.id,
    title: KickoffAtKyleEventDefinitions.KICKOFF_AT_KYLE_PARKING.name,
    url: KickoffAtKyleEventDefinitions.KICKOFF_AT_KYLE_PARKING.url,
    // Deliberately the popup without directions. The routing service backing "Directions To Here"
    // is unpublished (gis.it.tamu.edu/arcgis/rest/services/Routing returns no services) and is
    // being rewritten with no ETA, so the directions variant would ship a button that cannot work.
    // See #1003, which covers hiding the directions UI everywhere else.
    popupComponent: MarkdownPopupComponent,
    // Lots carry `name` (lot numbers such as "97", "100a") and `description` ("Free Event Parking",
    // "Reserved Event Parking").
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

export const KickoffAtKyleConfiguration: EventConfiguration = {
  id: 'kickoff-at-kyle',
  name: 'Kickoff at Kyle',
  applicationName: 'Kickoff at Kyle Transportation Map',
  shortApplicationName: 'Kickoff at Kyle Map',
  introductionText: 'Get the best transportation and logistics information for Kickoff at Kyle.',
  eventDates: ['2026-10-02'],
  // Centre and zoom derived from the service extent (WGS84): x -96.34988..-96.33725,
  // y 30.60111..30.61305 -- roughly 1.2km across.
  mapCenter: [-96.34356, 30.60708],
  zoom: 15,
  toast: {
    id: 'kickoff-at-kyle-notification',
    title: 'Kickoff at Kyle Transportation Map Available',
    message:
      'Attending Kickoff at Kyle? Click me to open the Kickoff at Kyle Transportation Map to get the best logistics and transportation information!',
    imgUrl: './assets/images/icons/sports/Football.png',
    imgAltText: 'Kickoff at Kyle Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/kickoff-at-kyle'
    }
  }
};

export const KickoffAtKyleOptions: SpecialEventOptions = [];

export const KickoffAtKyleTs: AggiemapCustomMapConfiguration = {
  configuration: KickoffAtKyleConfiguration,
  options: KickoffAtKyleOptions,
  sources: KickoffAtKyleColdLayerSources,
  references: KICKOFF_AT_KYLE_LAYERS,
  type: 'special-event',
  discover: {
    id: KickoffAtKyleConfiguration.id,
    name: KickoffAtKyleConfiguration.name,
    description: 'Transportation and parking information for Kickoff at Kyle.',
    source: 'internal',
    // Visible so the map reaches the All Maps search and Upcoming Events list. Note the sibling
    // 150th Opening Ceremony map, which shares this date, is deliberately hidden until the event is
    // announced -- if the same applies here, set this to false.
    visible: true,
    type: 'event',
    columnKey: 'fall',
    keywords: ['kickoff', 'kyle', 'kyle field', 'parking', 'transportation', '150', '150th']
  }
};
