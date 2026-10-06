import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import esri = __esri;

export enum AGGIELAND_SATURDAY_LAYERS {
  BUS_STOPS = 'aggieland-saturday-bus-stops',
  BUS_ROUTES = 'aggieland-saturday-bus-routes',
  SPECIAL_POIS = 'aggieland-saturday-special-pois',
  PARKING = 'aggieland-saturday-parking'
}

const eventUrl = Connections.aggielandSaturdayUrl;

export const AggielandSaturdayEventDefinitions = {
  EVENT_BUS_STOPS: {
    id: AGGIELAND_SATURDAY_LAYERS.BUS_STOPS,
    layerId: AGGIELAND_SATURDAY_LAYERS.BUS_STOPS,
    name: 'Bus Stops',
    url: `${eventUrl}/0`
  },
  EVENT_BUS_ROUTES: {
    id: AGGIELAND_SATURDAY_LAYERS.BUS_ROUTES,
    layerId: AGGIELAND_SATURDAY_LAYERS.BUS_ROUTES,
    name: 'Bus Routes',
    url: `${eventUrl}/1`
  },
  EVENT_SPECIAL_POIS: {
    id: AGGIELAND_SATURDAY_LAYERS.SPECIAL_POIS,
    layerId: AGGIELAND_SATURDAY_LAYERS.SPECIAL_POIS,
    name: 'Special Points of Interest',
    url: `${eventUrl}/2`
  },
  EVENT_PARKING: {
    id: AGGIELAND_SATURDAY_LAYERS.PARKING,
    layerId: AGGIELAND_SATURDAY_LAYERS.PARKING,
    name: 'Aggieland Saturday Parking',
    url: `${eventUrl}/3`
  }
};

export const AggielandSaturdayEventColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_PARKING.id,
    title: AggielandSaturdayEventDefinitions.EVENT_PARKING.name,
    url: AggielandSaturdayEventDefinitions.EVENT_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Event} Parking',
      description: 'Type: {attributes.Type}\nLot Name: {attributes.name}\nNotes: {attributes.Notes}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.id,
    title: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.name,
    url: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'Aggieland Saturday Bus Stop ({attributes.StopType})',
      description: 'Stop Name: {attributes.StopName}\nRoute Number: {attributes.Route}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.id,
    title: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.name,
    url: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.id,
    title: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.name,
    url: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'Aggieland Saturday Points of Interest',
      description: 'Type: {attributes.Type}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const AggielandSaturdayConfiguration: EventConfiguration = {
  id: 'aggieland-saturday',
  name: 'Aggieland Saturday',
  applicationName: 'Aggieland Saturday Transportation Map',
  shortApplicationName: 'Aggieland Saturday',
  introductionText: 'Transportation, parking, and bus route information for Aggieland Saturday.',
  eventDates: ['2026-02-28'],
  mapCenter: [-96.339, 30.611],
  zoom: 15
};

export const AggielandSaturdayOptions: SpecialEventOptions = [];

export const AggielandSaturdayEventTs: AggiemapCustomMapConfiguration = {
  configuration: AggielandSaturdayConfiguration,
  options: AggielandSaturdayOptions,
  sources: AggielandSaturdayEventColdLayerSources,
  references: AGGIELAND_SATURDAY_LAYERS,
  type: 'special-event',
  discover: {
    id: AggielandSaturdayConfiguration.id,
    name: AggielandSaturdayConfiguration.name,
    description: 'Transportation and parking information for Aggieland Saturday.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['aggieland', 'saturday', 'parking', 'bus', 'transportation']
  }
};
