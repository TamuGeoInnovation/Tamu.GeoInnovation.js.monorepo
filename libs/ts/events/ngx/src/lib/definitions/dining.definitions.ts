import { LayerSource } from '@tamu-gisc/common/types';
import { Connections, commonLayerProps } from '@tamu-gisc/aggiemap/ngx/common';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

/**
 * Layer ids used by the Dining kiosk map. `BUILDINGS` is the same always-on basemap layer shown by
 * default on the main map, and `DINING_LOCATIONS` is the one layer this kiosk map exists to show, on
 * from the start. As a kiosk map it loads none of the main map's layers, so these two and the
 * basemap are all it draws (#1392). Future kiosk maps for other layers can follow the same
 * pattern: reuse `BUILDINGS` as the standard basemap layer and add their own single layer.
 */
export enum DINING_KIOSK_LAYERS {
  // First, so it draws on top (docs/map-layers.md, "Drawing order"): the buildings are a near-invisible click layer,
  // and above the dining locations they took every click on one inside a building (#2552).
  DINING_LOCATIONS = 'dining-locations-layer',
  BUILDINGS = 'buildings-layer'
}

/**
 * The buildings every kiosk map draws, as the main map draws them by default. A kiosk loads none of the
 * main map's layers, so each kiosk adds this one itself: the Dining kiosk and the Football Tailgating
 * kiosk (#1975) both do.
 *
 * Not `essential`: an essential layer is made at start-up, as soon as it loads, so its place among the kiosk's own
 * layers depended on timing. Each kiosk's `references` place it instead, below what the kiosk is for (#2552).
 */
export const KioskBuildingsLayerSource: LayerSource = {
  type: 'feature',
  id: DINING_KIOSK_LAYERS.BUILDINGS,
  title: 'Buildings',
  url: `${Connections.basemapUrl}/1`,
  popupComponent: Popups.BuildingPopupComponent,
  listMode: 'hide',
  visible: true,
  native: {
    ...commonLayerProps,
    legendEnabled: false
  }
};

export const DiningKioskLayerSources: LayerSource[] = [
  KioskBuildingsLayerSource,
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
      // Overridden deliberately (#1576): this is a GeoJSON feed, which carries no symbology, so without
      // a renderer ArcGIS draws a plain default marker. The icons show open and closed, food truck or not.
      renderer: {
        type: 'unique-value',
        field: 'label',
        field2: 'type',
        fieldDelimiter: ',',
        uniqueValueInfos: [
          {
            value: 'open,food-truck',
            label: 'Food Truck - Open',
            symbol: {
              type: 'picture-marker',
              url: '/assets/images/icons/FoodTruck_open.png',
              width: '24px',
              height: '32px'
            }
          },
          {
            value: 'closed,food-truck',
            label: 'Food Truck - Closed',
            symbol: {
              type: 'picture-marker',
              url: '/assets/images/icons/FoodTruck_closed.png',
              width: '24px',
              height: '32px'
            }
          },
          {
            value: 'open,fixed',
            label: 'Dining - Open',
            symbol: {
              type: 'picture-marker',
              url: '/assets/images/icons/Dining_open.png',
              width: '24px',
              height: '32px'
            }
          },
          {
            value: 'closed,fixed',
            label: 'Dining - Closed',
            symbol: {
              type: 'picture-marker',
              url: '/assets/images/icons/Dining_closed.png',
              width: '24px',
              height: '32px'
            }
          }
        ]
      }
    }
  }
];

export const DiningKioskConfiguration: EventConfiguration = {
  id: 'dining',
  name: 'Dining',
  applicationName: 'Aggie Map - Dining',
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
