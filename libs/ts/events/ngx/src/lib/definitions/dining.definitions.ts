import { LayerSource } from '@tamu-gisc/common/types';
import { Connections, commonLayerProps } from '@tamu-gisc/aggiemap/ngx/common';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

/**
 * Layer ids used by the Dining kiosk map. `BUILDINGS` is the same always-on basemap layer shown by
 * default on the main map, and `DINING_LOCATIONS` is the one layer this kiosk map exists to show, on
 * from the start. As a kiosk map it loads none of the main map's layers, so these two and the
 * basemap are all it draws (#1392). Future kiosk maps for other layers can follow the same
 * pattern: reuse `BUILDINGS` as the standard basemap layer and add their own single layer.
 */
export enum DINING_KIOSK_LAYERS {
  BUILDINGS = 'buildings-layer',
  DINING_LOCATIONS = 'dining-locations-layer'
}

export const DiningKioskLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: DINING_KIOSK_LAYERS.BUILDINGS,
    title: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    popupComponent: Popups.BuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    layerIndex: 1,
    native: {
      ...commonLayerProps,
      legendEnabled: false
    }
  },
  {
    type: 'geojson',
    id: DINING_KIOSK_LAYERS.DINING_LOCATIONS,
    title: 'Dining Locations',
    url: Connections.diningLocationsUrl,
    // On, unlike the main map's toggle of the same id: dining is what this map is for.
    listMode: 'show',
    visible: true,
    popupComponent: Popups.DiningPopupComponent,
    native: {
      ...commonLayerProps,
    }
  }
];

export const DiningKioskConfiguration: EventConfiguration = {
  id: 'dining',
  name: 'Dining',
  applicationName: 'Aggie Map — Dining',
  shortApplicationName: 'Dining',
  introductionText: 'Campus dining locations.',
  eventDates: [],
  mapCenter: [-96.344672, 30.61306],
  zoom: 16,
  hideSidebar: true
};

export const DiningKioskOptions: SpecialEventOptions = [];

export const DiningKioskTs: AggiemapCustomMapConfiguration = {
  configuration: DiningKioskConfiguration,
  options: DiningKioskOptions,
  sources: DiningKioskLayerSources,
  references: DINING_KIOSK_LAYERS,
  type: 'general-map',
  discover: {
    id: DiningKioskConfiguration.id,
    name: DiningKioskConfiguration.name,
    description: 'Preset dining locations map with no sidebar/search UI, for embedding elsewhere (e.g., a mobile app webview).',
    source: 'internal',
    type: 'kiosk',
    mapType: 'kiosk'
  }
};
