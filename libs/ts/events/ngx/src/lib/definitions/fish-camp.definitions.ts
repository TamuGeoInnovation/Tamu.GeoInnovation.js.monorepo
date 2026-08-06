import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import esri = __esri;

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FISH_CAMP_LAYERS {
  ARRIVAL_GROUP = 'fish-camp-arrival-group',
  ARRIVAL_PARKING_INFO = 'fish-camp-arrival-parking-info',
  ARRIVAL_ROUTES = 'fish-camp-arrival-routes',
  ARRIVAL_PARKING_LOTS = 'fish-camp-arrival-parking-lots',
  DEPARTURE_GROUP = 'fish-camp-departure-group',
  DEPARTURE_PARKING_INFO = 'fish-camp-departure-parking-info',
  DEPARTURE_ROUTES = 'fish-camp-departure-routes',
  DEPARTURE_PARKING_LOTS = 'fish-camp-departure-parking-lots'
}

const fishCampUrl = Connections.fishCampUrl;

// The published service has no session-letter field. The two Fish Camp drop-off locations are
// distinguished entirely by the start/end date tagged on every feature:
//   - Reed area (lots 100b/100c): Jul 20 – Aug 6, 2026
//   - Lot 40b:                    Aug 7  – Aug 9, 2026
// The two ranges are disjoint, so a single split date (Aug 1) cleanly separates them and is robust
// to any timezone offset. Point/route layers expose the date as `Start_Date`; lot layers use
// `StartDate`, hence the two field variants below.
//
// Which session letters meet at which location is regrouped year to year, so it is carried only by
// the choice labels below — never by this filter.
const SESSION_SPLIT_DATE = "DATE '2026-08-01'";

enum FishCampBuilderOptions {
  SESSION = 'fish-camp-session'
}

// Keyed by drop-off location, the stable discriminator in the data. The string values are persisted
// to local storage and shared map URLs, so they keep their original session-letter spelling to avoid
// invalidating links users already hold.
enum FishCampSessionChoices {
  REED = 'sessions-a-f',
  LOT_40 = 'session-g'
}

const pointRouteDateFilter: Record<FishCampSessionChoices, string> = {
  [FishCampSessionChoices.REED]: `Start_Date < ${SESSION_SPLIT_DATE}`,
  [FishCampSessionChoices.LOT_40]: `Start_Date >= ${SESSION_SPLIT_DATE}`
};

const lotDateFilter: Record<FishCampSessionChoices, string> = {
  [FishCampSessionChoices.REED]: `StartDate < ${SESSION_SPLIT_DATE}`,
  [FishCampSessionChoices.LOT_40]: `StartDate >= ${SESSION_SPLIT_DATE}`
};

const pointRouteConversions = [
  { input: FishCampSessionChoices.REED, expression: pointRouteDateFilter[FishCampSessionChoices.REED] },
  { input: FishCampSessionChoices.LOT_40, expression: pointRouteDateFilter[FishCampSessionChoices.LOT_40] }
];

const lotConversions = [
  { input: FishCampSessionChoices.REED, expression: lotDateFilter[FishCampSessionChoices.REED] },
  { input: FishCampSessionChoices.LOT_40, expression: lotDateFilter[FishCampSessionChoices.LOT_40] }
];

const popup = {
  popupComponent: MarkdownPopupComponent,
  popupData: {
    name: { field: 'name' },
    description: { field: 'description' }
  }
};

// Routes are directional, so render each type with an arrowhead at the end of the line to show the
// direction of travel. Colors match the published service renderer (green = vehicle, blue = walking).
const routesNative: NonNullable<FeatureLayerSourceProperties['native']> = {
  outFields: ['*'],
  renderer: {
    type: 'unique-value',
    field: 'name',
    uniqueValueInfos: [
      {
        value: 'Preferred Vehicle Route',
        symbol: {
          type: 'simple-line',
          color: [0, 115, 76, 255],
          width: 4,
          marker: { style: 'arrow', color: [0, 115, 76, 255], placement: 'end' }
        } as unknown as esri.SimpleLineSymbolProperties
      },
      {
        value: 'Preferred Walking Route',
        // Walking routes read as a dashed line (vehicle routes stay solid) to visually
        // distinguish pedestrian travel; keep the end arrowhead to show direction.
        symbol: {
          type: 'simple-line',
          color: [0, 92, 230, 255],
          width: 3,
          style: 'dash',
          marker: { style: 'arrow', color: [0, 92, 230, 255], placement: 'end' }
        } as unknown as esri.SimpleLineSymbolProperties
      }
    ]
  }
};

/**
 * Builds the three feature-layer children that make up an Arrival/Departure group. The service
 * exposes the same shape (Parking Information, Routes, Parking Lots) for both phases at different
 * sub-layer indexes.
 */
function buildPhaseChildren(ids: {
  parkingInfo: FISH_CAMP_LAYERS;
  routes: FISH_CAMP_LAYERS;
  parkingLots: FISH_CAMP_LAYERS;
}, indexes: { parkingInfo: number; routes: number; parkingLots: number }): LayerSource[] {
  // Order matters: later entries draw on top. Parking Lots (polygons) sit at the bottom, Routes
  // (lines) above them, and Parking Information (points) on top.
  return [
    {
      type: 'feature',
      id: ids.parkingLots,
      title: 'Parking Lots',
      url: `${fishCampUrl}/${indexes.parkingLots}`,
      visible: true,
      listMode: 'show',
      ...popup,
      native: {
        outFields: ['*']
      }
    },
    {
      type: 'feature',
      id: ids.routes,
      title: 'Routes',
      url: `${fishCampUrl}/${indexes.routes}`,
      visible: true,
      listMode: 'show',
      ...popup,
      native: routesNative
    },
    {
      type: 'feature',
      id: ids.parkingInfo,
      title: 'Parking Information',
      url: `${fishCampUrl}/${indexes.parkingInfo}`,
      visible: true,
      listMode: 'show',
      ...popup,
      // The published picture-marker icons are pin-shaped (natural 32x40, ~0.8 ratio) but the
      // renderer forces them to a square (25x25 / 30x30), which stretches them. Re-render at a
      // matching 0.8 ratio (24x30) to remove the distortion — these sizing hints are applied to both
      // the legend swatches and the on-map symbols.
      legend: {
        mode: 'renderer-symbol',
        preserveAspectRatio: true,
        fit: 'contain',
        width: 24,
        height: 30
      },
      native: {
        outFields: ['*']
      }
    }
  ];
}

export const FishCampColdLayerSources: LayerSource[] = [
  {
    type: 'group',
    id: FISH_CAMP_LAYERS.ARRIVAL_GROUP,
    title: 'Send Off to Camp',
    // On by default; mutually exclusive with "Bring Back from Camp" (see exclusiveLayerIds).
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    sources: buildPhaseChildren(
      {
        parkingInfo: FISH_CAMP_LAYERS.ARRIVAL_PARKING_INFO,
        routes: FISH_CAMP_LAYERS.ARRIVAL_ROUTES,
        parkingLots: FISH_CAMP_LAYERS.ARRIVAL_PARKING_LOTS
      },
      { parkingInfo: 1, routes: 2, parkingLots: 3 }
    ),
    // Collapse the children so the group acts as a single on/off toggle in the layer list.
    native: {
      listMode: 'hide-children'
    }
  },
  {
    type: 'group',
    id: FISH_CAMP_LAYERS.DEPARTURE_GROUP,
    title: 'Bring Back from Camp',
    // Off by default; toggling it on turns "Send Off to Camp" off (see exclusiveLayerIds).
    visible: false,
    listMode: 'show',
    layerIndex: 60,
    sources: buildPhaseChildren(
      {
        parkingInfo: FISH_CAMP_LAYERS.DEPARTURE_PARKING_INFO,
        routes: FISH_CAMP_LAYERS.DEPARTURE_ROUTES,
        parkingLots: FISH_CAMP_LAYERS.DEPARTURE_PARKING_LOTS
      },
      { parkingInfo: 5, routes: 6, parkingLots: 7 }
    ),
    native: {
      listMode: 'hide-children'
    }
  }
];

export const FishCampConfiguration: EventConfiguration = {
  id: 'fish-camp',
  name: 'Fish Camp',
  applicationName: 'Fish Camp Parking & Transportation Map',
  shortApplicationName: 'Fish Camp Map',
  introductionText:
    'Plan ahead for Fish Camp send-off and pickup! Select your session to get the right parking, drop-off, and route information.',
  reviewText: 'Please review your selection. The map will zoom to your session’s send-off and pickup location.',
  eventDates: ['2026-07-20', '2026-08-09'],
  scheduleUrl: 'https://fishcamp.tamu.edu/',
  // Default framing before/without a session selection. Each session choice carries its own
  // `mapView` (see options below), which recenters the map on that session's location after load.
  mapCenter: [-96.34349, 30.60813],
  zoom: 16,
  legendAllowVisibilityToggle: true,
  legendCombineChildrenUnderPrimary: true,
  // The two phase groups behave as a radio: only one is on at a time.
  exclusiveLayerIds: [FISH_CAMP_LAYERS.ARRIVAL_GROUP, FISH_CAMP_LAYERS.DEPARTURE_GROUP],
  // Order the sidebar "Layers" list by source order (Send Off, then Bring Back) so it agrees
  // with the legend's draw order instead of sorting alphabetically.
  referenceLayerListOrder: 'source',
  // "Bring Back from Camp" starts hidden (radio default is Send Off), but it should still be
  // listed in the legend so users know it exists. Force both groups to always show.
  legendForceShowLayerIds: [FISH_CAMP_LAYERS.ARRIVAL_GROUP, FISH_CAMP_LAYERS.DEPARTURE_GROUP],
  builderStartStep: 'accommodations'
};

export const FishCampOptions: SpecialEventOptions = [
  {
    value: FishCampBuilderOptions.SESSION,
    label: 'Fish Camp Session',
    shortDescription: 'Fish Camp Session',
    description: 'Select your Fish Camp session to see the correct send-off and pickup location.',
    choices: [
      {
        value: FishCampSessionChoices.REED,
        label: 'Sessions B, C, E, & F',
        // Reed area (lots 100b / 100c). Tune center/zoom here to adjust framing.
        mapView: { center: [-96.34624, 30.60582], zoom: 17 }
      },
      {
        value: FishCampSessionChoices.LOT_40,
        label: 'Sessions A, D, & G',
        // Lot 40b. Tune center/zoom here to adjust framing.
        mapView: { center: [-96.33380, 30.61118], zoom: 17 }
      }
    ],
    effects: {
      layers: [
        { layerId: FISH_CAMP_LAYERS.ARRIVAL_PARKING_INFO, conversions: pointRouteConversions },
        { layerId: FISH_CAMP_LAYERS.ARRIVAL_ROUTES, conversions: pointRouteConversions },
        { layerId: FISH_CAMP_LAYERS.ARRIVAL_PARKING_LOTS, conversions: lotConversions },
        { layerId: FISH_CAMP_LAYERS.DEPARTURE_PARKING_INFO, conversions: pointRouteConversions },
        { layerId: FISH_CAMP_LAYERS.DEPARTURE_ROUTES, conversions: pointRouteConversions },
        { layerId: FISH_CAMP_LAYERS.DEPARTURE_PARKING_LOTS, conversions: lotConversions }
      ]
    }
  }
];

const FishCampLayerReferences: Record<string, string> = {
  ARRIVAL_GROUP: FISH_CAMP_LAYERS.ARRIVAL_GROUP,
  DEPARTURE_GROUP: FISH_CAMP_LAYERS.DEPARTURE_GROUP
};

export const FishCampTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: FishCampConfiguration,
  options: FishCampOptions,
  sources: FishCampColdLayerSources,
  references: FishCampLayerReferences,
  discover: {
    id: FishCampConfiguration.id,
    name: FishCampConfiguration.name,
    description: 'Parking, drop-off, and route information for Fish Camp send-off and pickup.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['fish camp', 'fishcamp', 'new student', 'send off', 'pickup', 'parking', 'transportation']
  }
};
