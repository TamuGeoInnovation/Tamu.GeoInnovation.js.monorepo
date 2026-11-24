import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import esri = __esri;

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { markdownPopup, RED_HATCH_LEGEND } from './common.definitions';

// Flat display map (no builder/sessions). The published service is four feature layers, drawn
// points-on-top: Points of Interest (0), Routes (1), Road Closures (2), Parking (3).
export enum GAMES_OF_TEXAS_LAYERS {
  POINTS_OF_INTEREST = 'games-of-texas-points-of-interest',
  ROUTES = 'games-of-texas-routes',
  ROAD_CLOSURES = 'games-of-texas-road-closures',
  PARKING = 'games-of-texas-parking'
}

const gamesOfTexasUrl = Connections.gamesOfTexasUrl;

// Routes are directional. Render each type as an arrow-tipped line so the direction of travel reads
// on the map. Colors match the publishedgreen = preferred route.
const routesNative: NonNullable<FeatureLayerSourceProperties['native']> = {
  outFields: ['*']
};

// Order matters: later entries draw on top. Parking (polygons) sit at the bottom, Road Closures and
// Routes above them, Points of Interest on top.
export const GamesOfTexasColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GAMES_OF_TEXAS_LAYERS.PARKING,
    title: 'Parking',
    url: `${gamesOfTexasUrl}/3`,
    visible: true,
    listMode: 'show',
    ...markdownPopup('name', 'description'),
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GAMES_OF_TEXAS_LAYERS.ROAD_CLOSURES,
    title: 'Road Closures',
    url: `${gamesOfTexasUrl}/2`,
    visible: true,
    listMode: 'show',
    ...markdownPopup('name', 'description'),
    // A red hatch, which ArcGIS draws no legend swatch for.
    legend: RED_HATCH_LEGEND,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GAMES_OF_TEXAS_LAYERS.ROUTES,
    title: 'Routes',
    url: `${gamesOfTexasUrl}/1`,
    visible: true,
    listMode: 'show',
    ...markdownPopup('name', 'description'),
    native: routesNative
  },
  {
    type: 'feature',
    id: GAMES_OF_TEXAS_LAYERS.POINTS_OF_INTEREST,
    title: 'Points of Interest',
    url: `${gamesOfTexasUrl}/0`,
    visible: true,
    listMode: 'show',
    ...markdownPopup('edited', 'description'),
    // The published picture-marker icons are pin-shaped (~0.8 ratio) but the renderer forces them
    // into a 25x25 square, which stretches them. Re-render the legend swatches at a matching 0.8
    // ratio (24x30) to remove the distortion.
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

export const GamesOfTexasConfiguration: EventConfiguration = {
  id: 'games-of-texas',
  name: 'Games of Texas',
  applicationName: 'Games of Texas Parking & Transportation Map',
  shortApplicationName: 'Games of Texas Map',
  introductionText: 'Parking, routes, and points of interest for the Games of Texas.',
  eventDates: ['2026-07-30', '2026-08-02'],
  mapCenter: [-96.34464, 30.60475],
  zoom: 16,
  legendAllowVisibilityToggle: true
};

export const GamesOfTexasOptions: SpecialEventOptions = [];

// Draw order is driven by the order of keys here (first key = topmost). Points of Interest on top,
// Parking at the bottom - matching the published map.
const GamesOfTexasLayerReferences: Record<string, string> = {
  POINTS_OF_INTEREST: GAMES_OF_TEXAS_LAYERS.POINTS_OF_INTEREST,
  ROUTES: GAMES_OF_TEXAS_LAYERS.ROUTES,
  ROAD_CLOSURES: GAMES_OF_TEXAS_LAYERS.ROAD_CLOSURES,
  PARKING: GAMES_OF_TEXAS_LAYERS.PARKING
};

export const GamesOfTexasTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: GamesOfTexasConfiguration,
  options: GamesOfTexasOptions,
  sources: GamesOfTexasColdLayerSources,
  references: GamesOfTexasLayerReferences,
  discover: {
    id: GamesOfTexasConfiguration.id,
    name: GamesOfTexasConfiguration.name,
    description: 'Parking, routes, and points of interest for the Games of Texas.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['games of texas', 'parking', 'transportation', 'routes', 'event']
  }
};
