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

/**
 * Picture-marker art from the service's published renderer, inlined because the hosted service's image
 * endpoint (`/0/images/<hash>`) returns 400, which would leave the markers and legend swatches blank.
 */
const EVENT_LOCATION_IMAGE_DATA =
  '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';

const SHUTTLE_IMAGE_DATA =
  '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' +
  'AAAAAElFTkSuQmCC';

// Both published pins are taller than wide (32x40 and 60x73 px) but are declared as square esriPMS
// symbols, which stretches them on the map. Re-render them at their native ratios.
const EVENT_LOCATION_ICON_URL = `data:image/png;base64,${EVENT_LOCATION_IMAGE_DATA}`;
const SHUTTLE_ICON_URL = `data:image/png;base64,${SHUTTLE_IMAGE_DATA}`;

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
    title: Kickoff150thDefinitions.EVENT_LOCATIONS.name,
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
      renderer: {
        type: 'unique-value',
        field: 'keywords',
        uniqueValueInfos: [
          {
            value: 'Event Location',
            label: 'Opening Ceremony Location',
            symbol: { type: 'picture-marker', url: EVENT_LOCATION_ICON_URL, width: 24, height: 30 }
          },
          {
            value: 'Shuttle',
            label: 'Shuttle',
            symbol: { type: 'picture-marker', url: SHUTTLE_ICON_URL, width: 25, height: 30 }
          }
        ]
      } as unknown as esri.RendererProperties
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: Kickoff150thDefinitions.SHUTTLE_ROUTE.id,
    title: Kickoff150thDefinitions.SHUTTLE_ROUTE.name,
    url: Kickoff150thDefinitions.SHUTTLE_ROUTE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      // The route is digitized from the PRG shuttle stop to the Lot 54 stop, so an arrowhead at the
      // end shows the direction of travel.
      renderer: {
        type: 'simple',
        label: 'Shuttle Route',
        symbol: {
          type: 'simple-line',
          color: 'rgb(38, 115, 0)',
          width: 2,
          style: 'solid',
          marker: {
            style: 'arrow',
            color: 'rgb(38, 115, 0)',
            placement: 'end'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: Kickoff150thDefinitions.PARKING.id,
    title: Kickoff150thDefinitions.PARKING.name,
    url: Kickoff150thDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: `{attributes.description}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const Kickoff150thConfiguration: EventConfiguration = {
  id: '150th-kickoff',
  name: '150th Kickoff',
  applicationName: '150th Kickoff Map',
  shortApplicationName: '150th Kickoff',
  eventDates: ['2026-10-02'],
  zoom: 16,
  mapCenter: [-96.3368, 30.6212]
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
    description: 'Event locations, shuttle route and parking for the 150th campus kickoff celebration.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    // RSVP-only campus kickoff: reachable by direct link (/events/150th-kickoff) but kept out of the
    // All Maps search, Upcoming Events and Campus Events lists so it isn't promoted to the public.
    visible: false,
    keywords: ['150', '150th', 'kickoff', 'celebration', 'shuttle', 'parking']
  }
};
