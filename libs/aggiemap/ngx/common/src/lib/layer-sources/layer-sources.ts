import { LayerSource } from '@tamu-gisc/common/types';

import { IComposedIDefinitions } from '../definitions';
import { IComposedConnections } from '../connections';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

import esri = __esri;

export const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export function LayerSources(
  connections: IComposedConnections,
  definitions: IComposedIDefinitions,
  options?: IFactoryExcludeOptions<IComposedIDefinitions>
): Array<LayerSource> {
  const all: Array<LayerSource> = [
    {
      type: 'feature',
      id: definitions.BUILDINGS.layerId,
      title: definitions.BUILDINGS.name,
      url: definitions.BUILDINGS.url,
      popupComponent: definitions.BUILDINGS.popupComponent,
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
      id: definitions.CONSTRUCTION.layerId,
      title: definitions.CONSTRUCTION.name,
      url: definitions.CONSTRUCTION.url,
      popupComponent: definitions.CONSTRUCTION.popupComponent,
      listMode: 'show',
      visible: true,
      layerIndex: 2,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.POINTS_OF_INTEREST.layerId,
      title: definitions.POINTS_OF_INTEREST.name,
      url: definitions.POINTS_OF_INTEREST.url,
      popupComponent: definitions.POINTS_OF_INTEREST.popupComponent,
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
      id: definitions.BONFIRE.layerId,
      title: definitions.BONFIRE.name,
      url: definitions.BONFIRE.url,
      popupComponent: definitions.BONFIRE.popupComponent,
      listMode: 'hide',
      visible: true,
      native: {
        ...commonLayerProps,
        labelingInfo: [],
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-fill',
            color: [0, 0, 0, 0.0],
            outline: {
              width: 0
            }
          }
        }
      }
    },
    {
      type: 'feature',
      id: definitions.RESTROOMS.layerId,
      title: definitions.RESTROOMS.name,
      url: definitions.RESTROOMS.url,
      popupComponent: definitions.RESTROOMS.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.LACTATION_ROOMS.layerId,
      title: definitions.LACTATION_ROOMS.name,
      url: definitions.LACTATION_ROOMS.url,
      popupComponent: definitions.LACTATION_ROOMS.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.SURFACE_LOTS.layerId,
      title: definitions.SURFACE_LOTS.name,
      url: definitions.SURFACE_LOTS.url,
      popupComponent: definitions.SURFACE_LOTS.popupComponent,
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
      id: definitions.VISITOR_PARKING.layerId,
      title: definitions.VISITOR_PARKING.name,
      url: definitions.VISITOR_PARKING.url,
      popupComponent: definitions.VISITOR_PARKING.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.ACESSIBLE_ENTRANCES.layerId,
      title: definitions.ACESSIBLE_ENTRANCES.name,
      url: definitions.ACESSIBLE_ENTRANCES.url,
      popupComponent: definitions.ACESSIBLE_ENTRANCES.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.EMERGENCY_PHONES.layerId,
      title: definitions.EMERGENCY_PHONES.name,
      url: definitions.EMERGENCY_PHONES.url,
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
      popupComponent: definitions.BUILDINGS.popupComponent,
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
    },
    {
      type: 'geojson',
      id: definitions.BIKE_LOCATIONS.layerId,
      title: definitions.BIKE_LOCATIONS.name,
      url: definitions.BIKE_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            size: 8,
            color: '#03C4A6'
          }
        }
      }
    },
    {
      type: 'geojson',
      id: definitions.DINING_LOCATIONS.layerId,
      title: definitions.DINING_LOCATIONS.name,
      url: definitions.DINING_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      popupComponent: definitions.DINING_LOCATIONS.popupComponent,
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
        } as any
      }
    }
  ];

  return all.filter((source) => {
    // Filter out any sources that are in the exclude list
    if (options && options.exclude && options.exclude.length > 0) {
      const keyId = options.exclude.some((key) => {
        return definitions[key].layerId === source.id;
      });

      if (keyId) {
        return false;
      }
    }

    return true;
  });
}

export const ThreeDLayers: Array<LayerSource> = [
  {
    type: 'scene',
    id: 'three-d-buildings-scene-layer',
    title: '3D Buildings',
    url: 'https://arcportal.ts.tamu.edu/arcgis/rest/services/Hosted/ESRI_3D_Presentation_2_0_WSL1/SceneServer',
    listMode: 'show',
    visible: true,
    native: {
      popupEnabled: false
    }
  }
];
