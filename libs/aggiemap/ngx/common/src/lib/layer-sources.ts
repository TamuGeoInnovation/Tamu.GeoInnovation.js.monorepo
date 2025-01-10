import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { Definitions } from './definitions';

import esri = __esri;

export const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.BUILDINGS.layerId,
    title: Definitions.BUILDINGS.name,
    url: Definitions.BUILDINGS.url,
    popupComponent: Definitions.BUILDINGS.popupComponent,
    listMode: 'hide',
    visible: true,
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
    type: 'feature',
    id: Definitions.CONSTRUCTION.layerId,
    title: Definitions.CONSTRUCTION.name,
    url: Definitions.CONSTRUCTION.url,
    popupComponent: Definitions.CONSTRUCTION.popupComponent,
    listMode: 'show',
    visible: true,
    layerIndex: 2,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.POINTS_OF_INTEREST.layerId,
    title: Definitions.POINTS_OF_INTEREST.name,
    url: Definitions.POINTS_OF_INTEREST.url,
    popupComponent: Definitions.POINTS_OF_INTEREST.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/images/markers/statue-icon.png',
          width: '20px',
          height: '30.2px'
        }
      }
    }
  },
  {
    type: 'feature',
    id: Definitions.RESTROOMS.layerId,
    title: Definitions.RESTROOMS.name,
    url: Definitions.RESTROOMS.url,
    popupComponent: Definitions.RESTROOMS.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.LACTATION_ROOMS.layerId,
    title: Definitions.LACTATION_ROOMS.name,
    url: Definitions.LACTATION_ROOMS.url,
    popupComponent: Definitions.LACTATION_ROOMS.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.SURFACE_LOTS.layerId,
    title: Definitions.SURFACE_LOTS.name,
    url: Definitions.SURFACE_LOTS.url,
    popupComponent: Definitions.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    visible: true,
    layerIndex: 1,
    native: {
      ...commonLayerProps,
      legendEnabled: false,
      opacity: 0.0,
      labelingInfo: [
        {
          symbol: {
            type: 'text',
            color: [0, 0, 0, 0]
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: Definitions.VISITOR_PARKING.layerId,
    title: Definitions.VISITOR_PARKING.name,
    url: Definitions.VISITOR_PARKING.url,
    popupComponent: Definitions.VISITOR_PARKING.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.ACESSIBLE_ENTRANCES.layerId,
    title: Definitions.ACESSIBLE_ENTRANCES.name,
    url: Definitions.ACESSIBLE_ENTRANCES.url,
    popupComponent: Definitions.ACESSIBLE_ENTRANCES.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: Definitions.EMERGENCY_PHONES.layerId,
    title: Definitions.EMERGENCY_PHONES.name,
    url: Definitions.EMERGENCY_PHONES.url,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    visible: true,
    popupComponent: Popups.BuildingPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'graphics',
    id: 'bus-route-layer',
    title: 'Bus Routes',
    listMode: 'hide',
    visible: true,
    native: {
      ...commonLayerProps
    }
  }
];
