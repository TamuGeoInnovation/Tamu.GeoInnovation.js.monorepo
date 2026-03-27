import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

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
  const bikeMapUrl = connections.tsMainUrl.replace('/TS_Main/MapServer', '/BikeMap/MapServer');
  const evChargeStationsUrl = connections.tsMainUrl.replace('/TS_Main/MapServer', '/EVChargeStations/MapServer');
  // If sustainable transportation is re-implemented against a different server/service set later,
  // update this shared source list alongside `libs/ts/events/ngx/src/lib/definitions/sustainable-transportation.definitions.ts`.
  const sustainableTransportationSources: Array<LayerSource> = [
    {
      type: 'feature',
      id: 'ev-charge-stations-layer',
      title: 'EV Charge Stations (Main + RELLIS)',
      url: `${evChargeStationsUrl}/0`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: '{attributes.EV_ID}',
        description:
          '<strong>Network</strong>: {attributes.EV_Network}\n' +
          '<strong>Charging Level</strong>: {attributes.Ch_Level}\n' +
          '<strong>Garage Level</strong>: {attributes.Garage_Lvl}\n' +
          '<strong>Notes</strong>: {attributes.EVCS_Notes}'
      },
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: 'bike-fix-stations-layer',
      title: 'Bike Fix Stations',
      url: `${bikeMapUrl}/1`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: '{attributes.Bike_Sta_Name}',
        description: '<strong>Amenities</strong>: {attributes.Bike_Amenities}'
      },
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: 'bike-lanes-layer',
      title: 'Bike Lanes',
      url: `${bikeMapUrl}/2`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: '{attributes.Use_}',
        description: '<strong>Location</strong>: {attributes.Location}'
      },
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: 'city-bike-lanes-routes-layer',
      title: 'City Bike Lanes and Routes',
      url: `${bikeMapUrl}/3`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: '{attributes.Use_}',
        description: '<strong>Location</strong>: {attributes.Location}'
      },
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: 'bike-racks-map-layer',
      title: 'Bike Racks',
      url: `${bikeMapUrl}/0`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: '{attributes.Type}',
        description:
          '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' + '<strong>Notes</strong>: {attributes.BR_Notes}'
      },
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: 'bike-dismount-zones-layer',
      title: 'Bike Dismount Zones',
      url: `${bikeMapUrl}/5`,
      listMode: 'show',
      visible: true,
      popupComponent: Popups.MarkdownPopupComponent,
      popupData: {
        name: 'Bike Dismount Zone'
      },
      native: {
        ...commonLayerProps
      }
    }
  ];

  const all: Array<LayerSource> = [
    {
      type: 'feature',
      id: definitions.BUILDINGS.layerId,
      title: definitions.BUILDINGS.name,
      url: definitions.BUILDINGS.url,
      popupComponent: definitions.BUILDINGS.popupComponent,
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
      type: 'feature',
      id: definitions.CONSTRUCTION.layerId,
      title: definitions.CONSTRUCTION.name,
      url: definitions.CONSTRUCTION.url,
      popupComponent: definitions.CONSTRUCTION.popupComponent,
      listMode: 'show',
      visible: false,
      essential: false,
      layerIndex: 2,
      native: {
        ...commonLayerProps,
        definitionExpression: `EndDate > CAST('${new Date().toISOString()}' AS DATE ) AND Status = 'Active'`
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
      essential: true,
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
      type: 'group',
      id: 'sustainable-transportation-group-layer',
      title: 'Sustainable Transportation',
      listMode: 'show',
      visible: false,
      sources: sustainableTransportationSources,
      native: {
        listMode: 'hide-children'
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
        } as unknown as esri.UniqueValueRenderer
      }
    },
    {
      type: 'feature',
      id: definitions.AGGIEPRINT_LOCATIONS.layerId,
      title: definitions.AGGIEPRINT_LOCATIONS.name,
      url: definitions.AGGIEPRINT_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      popupComponent: definitions.AGGIEPRINT_LOCATIONS.popupComponent,
      popupData: {
        description: `<strong>Access</strong>: {attributes.Access}\n<strong>Building</strong>: {attributes.BuildingName} ({attributes.BuildingNumber})\n<strong>Printer Type</strong>: {attributes.PrinterType}\n<strong>Details</strong>: {attributes.PrinterDetails}`
      },
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'unique-value',
          valueExpression: `When($feature.Access == 'Campus Member Accessible', 'all',  'restricted')`,
          uniqueValueInfos: [
            {
              value: 'all',
              label: 'Campus Member Accessible',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/services/printer-all-access.png',
                width: '24px',
                height: '32px'
              }
            },
            {
              value: 'restricted',
              label: 'Restricted Access Printers',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/services/printer-restricted.png',
                width: '24px',
                height: '32px'
              }
            }
          ]
        } as unknown as esri.UniqueValueRenderer
      }
    },
    {
      type: 'feature',
      id: definitions.FAMILY_FRIENDLY_BATHROOMS.layerId,
      title: definitions.FAMILY_FRIENDLY_BATHROOMS.name,
      url: definitions.FAMILY_FRIENDLY_BATHROOMS.url,
      popupComponent: definitions.FAMILY_FRIENDLY_BATHROOMS.popupComponent,
      listMode: 'show',
      visible: false,
      popupData: {
        description:
          '<strong>Building</strong>: {attributes.Name}\n' + '<strong>Restroom Location(s)</strong>: {attributes.Notes}'
      },
      native: {
        ...commonLayerProps,
        definitionExpression: "showOnAggieMap = 'Y'"
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
    url: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/SketchupCampus_2082019/SceneServer',
    listMode: 'show',
    visible: true,
    // popupComponent: Popups.BasePopupComponent,
    native: {
      outFields: ['*'],
      definitionExpression: "WhereFrom = 'arch'",
      popupEnabled: false,
      elevationInfo: {
        mode: 'absolute-height',
        offset: -107,
        unit: 'meters'
      },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'mesh-3d',
          symbolLayers: [
            {
              type: 'fill',
              material: {
                color: 'rgba(209, 210, 202, 1)',
                colorMixMode: 'replace'
              },
              edges: {
                type: 'solid',
                color: 'rgba(0, 0, 0, 0.75)',
                size: '1px'
              },
              castShadows: true
            }
          ]
        }
      } as any
    }
  }
];
