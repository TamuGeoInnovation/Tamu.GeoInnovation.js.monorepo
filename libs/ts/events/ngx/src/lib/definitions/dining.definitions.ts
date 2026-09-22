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
 * default on the main map, and `DINING_LOCATIONS` is the one layer this kiosk map forces visible via
 * `defaultLayerOverrides` below. Future kiosk maps for other layers can follow the same pattern:
 * reuse `BUILDINGS` as the standard basemap layer and add their own single toggle layer.
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
      legendEnabled: false,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'geojson',
    id: DINING_KIOSK_LAYERS.DINING_LOCATIONS,
    title: 'Dining Locations',
    url: Connections.diningLocationsUrl,
    // Off by default like the main map's toggle; forced on for this kiosk map via
    // `defaultLayerOverrides` on `DiningKioskConfiguration`.
    listMode: 'show',
    visible: false,
    popupComponent: Popups.DiningPopupComponent,
    native: {
      ...commonLayerProps,
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
      } as unknown as esri.UniqueValueRenderer
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
  hideSidebar: true,
  defaultLayerOverrides: {
    [DINING_KIOSK_LAYERS.DINING_LOCATIONS]: {
      listMode: 'show',
      visible: true
    }
  }
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
