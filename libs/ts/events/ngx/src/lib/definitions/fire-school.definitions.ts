import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FIRE_SCHOOL_LAYERS {
  PREFERRED_ROUTE = 'fire-school-preferred-route',
  ROAD_CLOSURES = 'fire-school-road-closures',
  PARKING_LOTS = 'fire-school-parking-lots'
}

const fireSchoolUrl = Connections.fireSchoolUrl;

// The Preferred Route is directional, so render it with an arrowhead at the end of the line to show
// the direction of travel. The published renderer is a single solid green line (no marker); keep the
// green and add the arrowhead. The symbol field is an AutoCastSymbols intersection, so the whole
// native object is cast rather than the individual symbol.
const preferredRouteNative = {
  outFields: ['*'],
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-line',
      color: [38, 115, 0, 255],
      width: 2,
      marker: { style: 'arrow', color: [38, 115, 0, 255], placement: 'end' }
    }
  }
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

// The Road Closures layer uses a backward-diagonal red hatch fill, which the ArcGIS legend does not
// emit a swatch for. Supply an explicit matching red-hatch swatch so the legend entry has an icon.
const ROAD_CLOSURE_LEGEND_SWATCH =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSI1IiBzdHJva2U9IiNlNjAwMDAiIHN0cm9rZS13aWR0aD0iMS4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjIxIiBoZWlnaHQ9IjIxIiBmaWxsPSJ1cmwoI3ApIiBzdHJva2U9IiNlNjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==';

export const FireSchoolColdLayerSources: LayerSource[] = [
  // NOTE: this array's order does not determine z-order — map draw order is driven by the order of
  // `FireSchoolLayerReferences` below (see the comment there).
  {
    type: 'feature',
    id: FIRE_SCHOOL_LAYERS.PREFERRED_ROUTE,
    title: 'Preferred Route',
    url: `${fireSchoolUrl}/0`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    native: preferredRouteNative
  },
  {
    type: 'feature',
    id: FIRE_SCHOOL_LAYERS.ROAD_CLOSURES,
    title: 'Road Closures',
    url: `${fireSchoolUrl}/1`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Road Closure',
      description: { field: 'description' }
    },
    legend: {
      mode: 'custom-src',
      src: ROAD_CLOSURE_LEGEND_SWATCH,
      width: 22,
      height: 22
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FIRE_SCHOOL_LAYERS.PARKING_LOTS,
    title: 'Parking Lots',
    url: `${fireSchoolUrl}/2`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    // Solid-fill unique-value renderer (Lot Restrictions / General Parking) is published correctly,
    // so use it as-is — the legend swatches render fine.
    native: {
      outFields: ['*']
    }
  }
];

export const FireSchoolConfiguration: EventConfiguration = {
  id: 'fire-school',
  name: 'Municipal Fire School Vendor Show',
  applicationName: 'Municipal Fire School Vendor Show Map',
  shortApplicationName: 'Fire School Vendor Show',
  introductionText:
    'Preferred route, road closures, and parking lot information for the Municipal Fire School Vendor Show.',
  eventDates: ['2026-07-17', '2026-07-19'],
  mapCenter: [-96.34426, 30.6067],
  zoom: 17,
  legendAllowVisibilityToggle: true
};

export const FireSchoolOptions: SpecialEventOptions = [];

// The order of this reference map drives the map draw order (NOT the order of the sources array
// above): EventService reverses this list and adds each layer with `map.add()`, so the FIRST entry
// here is added last and ends up on TOP. Matches the published map's drawing order: Preferred Route
// on top, then Road Closures, then Parking Lots beneath both.
const FireSchoolLayerReferences: Record<string, string> = {
  PREFERRED_ROUTE: FIRE_SCHOOL_LAYERS.PREFERRED_ROUTE,
  ROAD_CLOSURES: FIRE_SCHOOL_LAYERS.ROAD_CLOSURES,
  PARKING_LOTS: FIRE_SCHOOL_LAYERS.PARKING_LOTS
};

export const FireSchoolTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: FireSchoolConfiguration,
  options: FireSchoolOptions,
  sources: FireSchoolColdLayerSources,
  references: FireSchoolLayerReferences,
  discover: {
    id: FireSchoolConfiguration.id,
    name: FireSchoolConfiguration.name,
    description: 'Preferred route, road closures, and parking lot information for the Municipal Fire School Vendor Show.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['fire school', 'municipal fire school', 'vendor show', 'vendor', 'parking', 'road closures', 'route']
  }
};
