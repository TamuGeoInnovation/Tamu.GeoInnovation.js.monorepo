import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import esri = __esri;

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum T_CAMP_LAYERS {
  CAMPUS_LOCATIONS = 't-camp-campus-locations',
  ENTRY_ROUTE = 't-camp-entry-route',
  CLOSURES = 't-camp-closures',
  PARKING = 't-camp-parking'
}

const tCampUrl = Connections.tCampUrl;

// Every feature in the service carries a rich, pre-formatted HTML `description` along with a `name`,
// so a single name/description popup works for all four layers.
const popup = {
  popupComponent: MarkdownPopupComponent,
  popupData: {
    name: { field: 'name' },
    description: { field: 'description' }
  }
};

const campusLocationsNative: NonNullable<FeatureLayerSourceProperties['native']> = {
  outFields: ['*']
};

// Match the on-map fix in the legend: pull the (now correctly proportioned) icon from the renderer
// and render the swatch at the same 0.8 ratio so it isn't stretched square either.
const campusLocationsLegend: NonNullable<LayerSource['legend']> = {
  mode: 'renderer-symbol',
  preserveAspectRatio: true,
  fit: 'contain',
  width: 24,
  height: 30
};

// The entry route is directional, so render it as a green line with an arrowhead at the end to show
// the direction of travel. Green matches the published renderer color.
const entryRouteNative = {
  outFields: ['*']
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

export const TCampColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: T_CAMP_LAYERS.CLOSURES,
    title: 'Closures',
    url: `${tCampUrl}/2`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: {
      outFields: ['*'],
      // Layers 2 and 3 are the same five features (three lots, two closures). Filter each one here so
      // it doesn't rely on the published unique-value renderer to hide the other layer's features.
      definitionExpression: `type = 'Closure'`
    }
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.PARKING,
    title: 'Parking',
    url: `${tCampUrl}/3`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: {
      outFields: ['*'],
      definitionExpression: `type = 'Parking'`
    }
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.ENTRY_ROUTE,
    title: 'Entry Route',
    url: `${tCampUrl}/1`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: entryRouteNative
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.CAMPUS_LOCATIONS,
    title: 'Campus Locations',
    url: `${tCampUrl}/0`,
    visible: true,
    listMode: 'show',
    ...popup,
    legend: campusLocationsLegend,
    native: campusLocationsNative
  }
];

export const TCampConfiguration: EventConfiguration = {
  id: 't-camp',
  name: 'T Camp',
  applicationName: 'T Camp Parking & Transportation Map',
  shortApplicationName: 'T Camp Map',
  introductionText: 'Find parking, entry routes, and closures for T Camp. Use the map to plan your drop-off and pickup.',
  eventDates: [],
  scheduleUrl: 'https://transport.tamu.edu/Parking/Events/camp.aspx',
  // The Williams Alumni Center sits ~570m southwest of the lots, so the initial view has to cover the
  // full extent of all four layers (~460m x ~575m) rather than framing the lots alone. Centered on
  // that combined extent at the zoom level that fits it.
  mapCenter: [-96.33368, 30.61101],
  zoom: 17,
  legendAllowVisibilityToggle: true
};

export const TCampOptions: SpecialEventOptions = [];

export const TCampTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TCampConfiguration,
  options: TCampOptions,
  sources: TCampColdLayerSources,
  references: T_CAMP_LAYERS,
  discover: {
    id: TCampConfiguration.id,
    name: TCampConfiguration.name,
    description: 'Parking, entry routes, and closures for T Camp.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['t camp', 'tcamp', 'transfer camp', 'new student', 'parking', 'transportation', 'closures', 'entry route']
  }
};
