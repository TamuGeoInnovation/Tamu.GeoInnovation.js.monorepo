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
 *
 * Because these are static copies (not fetched live from the service), this data goes stale whenever
 * the source renderer's symbol is updated in ArcGIS -- the map keeps showing whatever was inlined here
 * at the time this file was last synced. If a marker looks outdated, re-pull `imageData` from
 * `${eventUrl}/0?f=json` (`drawingInfo.renderer.uniqueValueGroups[0].classes[].symbol.imageData`) and
 * paste the refreshed base64 in below. Last synced: 2026-09-23 (Event Location symbol refreshed).
 */
const EVENT_LOCATION_IMAGE_DATA =
  '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' +
  '2QAAAABJRU5ErkJggg==';

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
            label: 'Event Location',
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
  // The route id stays `150th-kickoff` so links already shared for this map keep working, even
  // though the event has since been renamed to the 150th Opening Ceremony.
  id: '150th-kickoff',
  name: '150th Opening Ceremony',
  applicationName: '150th Opening Ceremony Map',
  shortApplicationName: '150th Opening Ceremony',
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
    description: 'Event locations, shuttle route and parking for the 150th Opening Ceremony celebration.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    // Not public yet: reachable by direct link (/events/150th-kickoff) but kept out of the All Maps
    // search, Upcoming Events and Campus Events lists so it isn't promoted until the event is announced.
    visible: false,
    keywords: ['150', '150th', 'opening', 'ceremony', 'kickoff', 'celebration', 'shuttle', 'parking']
  }
};
