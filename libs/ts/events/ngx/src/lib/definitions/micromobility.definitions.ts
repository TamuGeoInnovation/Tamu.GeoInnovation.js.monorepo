import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

/**
 * Transportation's draft micromobility map (#2712): where scooters and bikes may ride on campus.
 *
 * Titles, symbols and drawing order are the service's own (`docs/map-layers.md`), so nothing here names a
 * layer. The order below is the service's, top first: layer 0 draws on top.
 */
export enum MICROMOBILITY_LAYERS {
  SLOW_ZONES = 'micromobility-slow-zones',
  SHARED_PATHS = 'micromobility-shared-paths',
  DEDICATED_PATHS = 'micromobility-dedicated-paths'
}

const serviceUrl = Connections.micromobilityUrl;

/**
 * Every layer is a line with a `name` (e.g. "Shared Paths") and a `notes` (e.g. "Shared Path"; empty on Dedicated
 * Micromobility Paths), so one popup fits all three. The layers are Transportation's approved paths (#2812).
 */
const source = (id: MICROMOBILITY_LAYERS, index: number): LayerSource =>
  ({
    type: 'feature',
    id,
    url: `${serviceUrl}/${index}`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.notes'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }) as LayerSource;

export const MicromobilityLayerSources: LayerSource[] = [
  source(MICROMOBILITY_LAYERS.SLOW_ZONES, 0),
  source(MICROMOBILITY_LAYERS.SHARED_PATHS, 1),
  source(MICROMOBILITY_LAYERS.DEDICATED_PATHS, 2)
];

export const MicromobilityConfiguration: EventConfiguration = {
  id: 'micromobility',
  name: 'Micromobility',
  applicationName: 'Micromobility Map',
  shortApplicationName: 'Micromobility',
  introductionText:
    'Where scooters and bikes can ride on Main Campus: slow zones, shared paths and dedicated micromobility paths.',
  eventDates: [],
  // The centre of the three layers' combined extent (WGS84), about 3 km across.
  mapCenter: [-96.34377, 30.61419],
  zoom: 15
};

export const MicromobilityOptions: SpecialEventOptions = [];

export const MicromobilityTs: AggiemapCustomMapConfiguration = {
  configuration: MicromobilityConfiguration,
  options: MicromobilityOptions,
  sources: MicromobilityLayerSources,
  references: MICROMOBILITY_LAYERS,
  type: 'general-map',
  discover: {
    id: MicromobilityConfiguration.id,
    name: MicromobilityConfiguration.name,
    description: 'Where scooters and bikes can ride on Main Campus.',
    source: 'internal',
    type: 'parking',
    // Transportation, not parking: this map is about getting around campus, not leaving a car
    // somewhere (#2738). `parkingCategory` with no `mapType` left it listed nowhere at all, so
    // neither a visitor nor the smoke suite's crawl could reach it.
    mapType: 'transportation',
    parkingCategory: 'general',
    keywords: [
      'micromobility',
      'scooter',
      'e-scooter',
      'bike',
      'bicycle',
      'dedicated path',
      'slow zone',
      'sidewalk',
      'shared path',
      'sharrow',
      'transportation'
    ]
  }
};
