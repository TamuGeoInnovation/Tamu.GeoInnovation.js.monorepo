import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';
import { RED_HATCH_LEGEND } from './common.definitions';

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
  outFields: ['*']
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

export const FireSchoolColdLayerSources: LayerSource[] = [
  // NOTE: this array's order does not determine z-order - map draw order is driven by the order of
  // `FireSchoolLayerReferences` below (see the comment there).
  {
    type: 'feature',
    id: FIRE_SCHOOL_LAYERS.PREFERRED_ROUTE,
    title: 'Preferred Route',
    url: `${fireSchoolUrl}/0`,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'Road Closure',
      description: { field: 'description' }
    },
    // A red hatch, which ArcGIS draws no legend swatch for.
    legend: RED_HATCH_LEGEND,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    // Solid-fill unique-value renderer (Lot Restrictions / General Parking) is published correctly,
    // so use it as-is - the legend swatches render fine.
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
  introductionText: 'Preferred route, road closures, and parking lot information for the Municipal Fire School Vendor Show.',
  eventDates: ['2026-07-17', '2026-07-19'],
  // Centred on the parking lots' own extent (#3907), as the Fire School Parking Lots layer answers it on production
  // (28 November 2026: -96.34938 to -96.34396, 30.60311 to 30.6079), which holds the road closures too. The centre was
  // 230 metres north-east of it, so the lots ran off the bottom of a desktop's map and the closures off the left of a
  // phone's. The zoom is kept: at 17 the lots are about 505 by 515 pixels, clear of a desktop's map but wider than a
  // phone's, where the closures are what a visitor opens it to see. `layer-in-view.spec.ts` checks both.
  mapCenter: [-96.34667, 30.60551],
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
