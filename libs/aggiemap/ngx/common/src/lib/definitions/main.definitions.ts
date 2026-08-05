import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { IComposedConnections } from '../connections';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

import esri = __esri;

export enum MAIN_MAP_LAYERS {
  BUILDINGS = 'buildings-layer',
  CONSTRUCTION = 'construction_zone-layer',
  POINTS_OF_INTEREST = 'poi-layer',
  BONFIRE = 'bonfire-layer',
  LACTATION_ROOMS = 'lactation-rooms-layer',
  SURFACE_LOTS = 'surface-lots-layer',
  VISITOR_PARKING = 'visitor-parking-layer',
  TRANSPORTATION_PARKING = 'transportation-parking-layer',
  RNS_SPACES = 'rns-spaces-layer',
  ACESSIBLE_ENTRANCES = 'accessible-entrances-layer',
  EMERGENCY_PHONES = 'emergency-phones-layer',
  BIKE_RACKS = 'bike-racks-layer',
  BIKE_LOCATIONS = 'bike-locations-layer',
  DINING_LOCATIONS = 'dining-locations-layer',
  AGGIEPRINT_LOCATIONS = 'aggieprint-locations-layer',
  SINGLE_OCCUPANCY_RESTROOMS = 'single-occupancy-restroom-locations-layer',
  BIKE_DISMOUNT_ZONES = 'bike-dismount-zones-layer',
  CITY_BIKE_LANES_ROUTES = 'city-bike-lanes-routes-layer',
  CAMPUS_BIKE_LANES = 'bike-lanes-layer',
  BIKE_FIX_STATIONS = 'bike-fix-stations-layer',
  BIKE_RACKS_MAP = 'bike-racks-map-layer',
  EV_CHARGE_STATIONS = 'ev-charge-stations-layer'
}

export interface IDefinition {
  id: string;
  layerId: string;
  name: string;
  url: string;
  popupComponent?: unknown;
}

export interface IComposedIDefinitions {
  BUILDINGS: IDefinition;
  CONSTRUCTION: IDefinition;
  POINTS_OF_INTEREST: IDefinition;
  BONFIRE: IDefinition;
  LACTATION_ROOMS: IDefinition;
  SURFACE_LOTS: IDefinition;
  VISITOR_PARKING: IDefinition;
  TRANSPORTATION_PARKING: IDefinition;
  RNS_SPACES: IDefinition;
  ACESSIBLE_ENTRANCES: IDefinition;
  EMERGENCY_PHONES: IDefinition;
  BIKE_RACKS: IDefinition;
  BIKE_LOCATIONS: IDefinition;
  DINING_LOCATIONS: IDefinition;
  AGGIEPRINT_LOCATIONS: IDefinition;
  SINGLE_OCCUPANCY_RESTROOMS: IDefinition;
  BIKE_DISMOUNT_ZONES: IDefinition;
  CITY_BIKE_LANES_ROUTES: IDefinition;
  CAMPUS_BIKE_LANES: IDefinition;
  BIKE_FIX_STATIONS: IDefinition;
  BIKE_RACKS_MAP: IDefinition;
  EV_CHARGE_STATIONS: IDefinition;
}

export const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

export function MainMapDefinitions(connections: IComposedConnections): IComposedIDefinitions {
  return {
    BUILDINGS: {
      id: 'buildings',
      layerId: MAIN_MAP_LAYERS.BUILDINGS,
      name: 'Buildings',
      url: `${connections.basemapUrl}/1`,
      popupComponent: Popups.BuildingPopupComponent
    },
    CONSTRUCTION: {
      id: 'construction_zone',
      layerId: MAIN_MAP_LAYERS.CONSTRUCTION,
      name: 'Construction Zones',
      url: `${connections.constructionUrl}`,
      popupComponent: Popups.ConstructionPopupComponent
    },
    POINTS_OF_INTEREST: {
      id: 'poi',
      layerId: MAIN_MAP_LAYERS.POINTS_OF_INTEREST,
      name: 'Points of Interest',
      url: `${connections.poiUrl}/0`,
      popupComponent: Popups.PoiPopupComponent
    },
    BONFIRE: {
      id: 'bonfire',
      layerId: MAIN_MAP_LAYERS.BONFIRE,
      name: 'Bonfire Memorial',
      url: `${connections.poiUrl}/1`,
      popupComponent: Popups.BonfirePopupComponent
    },
    LACTATION_ROOMS: {
      id: 'lactation-rooms',
      layerId: MAIN_MAP_LAYERS.LACTATION_ROOMS,
      name: 'Lactation Rooms',
      url: `${connections.inforUrl}/2`,
      popupComponent: Popups.LactationPopupComponent
    },
    SURFACE_LOTS: {
      id: 'surface-lots',
      layerId: MAIN_MAP_LAYERS.SURFACE_LOTS,
      name: 'Surface Lots',
      url: `${connections.basemapUrl}/9`,
      popupComponent: Popups.ParkingLotPopupComponent
    },
    VISITOR_PARKING: {
      id: 'visitor-parking',
      layerId: MAIN_MAP_LAYERS.VISITOR_PARKING,
      name: 'Visitor Parking',
      url: `${connections.tsMainUrl}/4`,
      popupComponent: Popups.ParkingKioskPopupComponent
    },
    TRANSPORTATION_PARKING: {
      id: 'transportation-parking',
      layerId: MAIN_MAP_LAYERS.TRANSPORTATION_PARKING,
      name: 'Transportation Parking',
      url: `${connections.tsMainUrl}/6`,
      popupComponent: Popups.ParkingKioskPopupComponent
    },
    RNS_SPACES: {
      id: 'rns-spaces',
      layerId: MAIN_MAP_LAYERS.RNS_SPACES,
      name: 'RNS Spaces',
      url: `${connections.tsMainUrl}/7`
    },
    ACESSIBLE_ENTRANCES: {
      id: 'accessible-entrances',
      layerId: MAIN_MAP_LAYERS.ACESSIBLE_ENTRANCES,
      name: 'Accessible Building Entrances',
      url: `${connections.accessibleUrl}`,
      popupComponent: Popups.AccessiblePopupComponent
    },
    EMERGENCY_PHONES: {
      id: 'emergency-phones',
      layerId: MAIN_MAP_LAYERS.EMERGENCY_PHONES,
      name: 'Emergency Phones',
      url: `${connections.inforUrl}/4`
    },
    BIKE_RACKS: {
      id: 'bike-racks',
      layerId: MAIN_MAP_LAYERS.BIKE_RACKS,
      name: 'Bike Racks',
      url: `${connections.bikeRacksUrl}`
    },
    BIKE_LOCATIONS: {
      id: 'bike-locations',
      layerId: MAIN_MAP_LAYERS.BIKE_LOCATIONS,
      name: 'VeoRide Bikes',
      url: `${connections.bikeLocationsUrl}`
    },
    DINING_LOCATIONS: {
      id: 'dining-locations',
      layerId: MAIN_MAP_LAYERS.DINING_LOCATIONS,
      name: 'Dining Locations',
      url: `${connections.diningLocationsUrl}`,
      popupComponent: Popups.DiningPopupComponent
    },
    AGGIEPRINT_LOCATIONS: {
      id: 'aggieprint-locations',
      layerId: MAIN_MAP_LAYERS.AGGIEPRINT_LOCATIONS,
      name: 'AggiePrint Locations',
      url: `${connections.aggiePrintUrl}/0`,
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
    },
    SINGLE_OCCUPANCY_RESTROOMS: {
      id: 'single-occupancy-restroom-locations',
      layerId: MAIN_MAP_LAYERS.SINGLE_OCCUPANCY_RESTROOMS,
      name: 'Single Occupancy Restroom Locations',
      url: `${connections.inforUrl}/1`,
      popupComponent: Popups.MarkdownWDirectionsPopupComponent
    },
    BIKE_DISMOUNT_ZONES: {
      id: 'bike-dismount-zones',
      layerId: MAIN_MAP_LAYERS.BIKE_DISMOUNT_ZONES,
      name: 'Dismount Zones',
      url: `${connections.bikeMapUrl}/5`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    CITY_BIKE_LANES_ROUTES: {
      id: 'city-bike-lanes-routes',
      layerId: MAIN_MAP_LAYERS.CITY_BIKE_LANES_ROUTES,
      name: 'City Bike Lanes and Routes',
      url: `${connections.bikeMapUrl}/4`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    CAMPUS_BIKE_LANES: {
      id: 'campus-bike-lanes',
      layerId: MAIN_MAP_LAYERS.CAMPUS_BIKE_LANES,
      name: 'Campus Bike Lanes',
      url: `${connections.bikeMapUrl}/3`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    BIKE_FIX_STATIONS: {
      id: 'bike-fix-stations',
      layerId: MAIN_MAP_LAYERS.BIKE_FIX_STATIONS,
      name: 'Bike Fix Stations',
      url: `${connections.bikeMapUrl}/2`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    BIKE_RACKS_MAP: {
      id: 'bike-racks-map',
      layerId: MAIN_MAP_LAYERS.BIKE_RACKS_MAP,
      name: 'Bike Racks',
      url: `${connections.bikeMapUrl}/1`,
      popupComponent: Popups.MarkdownPopupComponent
    },
    EV_CHARGE_STATIONS: {
      id: 'ev-charge-stations',
      layerId: MAIN_MAP_LAYERS.EV_CHARGE_STATIONS,
      name: 'EV Charge Stations (Main + RELLIS)',
      url: `${connections.bikeMapUrl}/0`,
      popupComponent: Popups.MarkdownPopupComponent
    }
  };
}

export function MainMapLayerSources(
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
      layerIndex: 4,
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
      layerIndex: 2,
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
      layerIndex: 3,
      native: {
        ...commonLayerProps
      }
    },
    {
      // Reserved Numbered Space (RNS) labels. Points are invisible; only the number
      // labels render, so each reserved/numbered space shows its number when zoomed in.
      type: 'feature',
      id: definitions.RNS_SPACES.layerId,
      title: definitions.RNS_SPACES.name,
      url: definitions.RNS_SPACES.url,
      listMode: 'hide',
      visible: true,
      layerIndex: 5,
      native: {
        ...commonLayerProps,
        legendEnabled: false,
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            size: 0,
            color: [0, 0, 0, 0],
            outline: { width: 0, color: [0, 0, 0, 0] }
          }
        },
        labelsVisible: true,
        labelingInfo: [
          {
            // Department-reserved spaces: "DEPT. RESERVED" + the space number.
            where: `Anno_Type IS NULL OR Anno_Type NOT IN ('Serv', 'M/C', 'H/C', '2HR Timed', 'Loading')`,
            labelExpressionInfo: {
              expression: `
                if ($feature.DeptSpc_YN != 1) { return ''; }
                var num = Trim(Text($feature.RNS_Num));
                if (num == null || num == '' || num == 'null') { num = Trim(Text($feature.Spc_ID_Num)); }
                if (num == null || num == '' || num == 'null') { return 'DEPT. RESERVED'; }
                return 'DEPT. RESERVED' + TextFormatting.NewLine + num;
              `
            },
            labelPlacement: 'center-center',
            symbol: {
              type: 'text',
              color: [80, 0, 0, 255],
              haloColor: [255, 255, 255, 255],
              haloSize: 1.5,
              font: { size: 8, family: 'Arial', weight: 'bold' }
            },
            minScale: 1200,
            maxScale: 0,
            deconflictionStrategy: 'none'
          },
          {
            // All other reserved/numbered spaces: show whichever space-number field is
            // populated. RNS_Num is authoritative (the only populated field for reserved
            // spaces in many lots, e.g. Lot 96 '9608'); VisSpcNum/RV_SpcNum/Spc_ID_Num
            // are fallbacks for visitor/RV/other numbered spaces.
            where: `Anno_Type IS NULL OR Anno_Type NOT IN ('Serv', 'M/C', '2HR Timed', 'Loading')`,
            labelExpressionInfo: {
              expression: `
                if ($feature.Anno_Type == 'H/C') { return ''; }
                if ($feature.DeptSpc_YN == 1) { return ''; }
                var rnsNum = Trim(Text($feature.RNS_Num));
                if (rnsNum != null && rnsNum != '' && rnsNum != 'null') { return rnsNum; }
                var visNum = Trim(Text($feature.VisSpcNum));
                if (visNum != null && visNum != '' && visNum != 'null') { return visNum; }
                var rvNum = Trim(Text($feature.RV_SpcNum));
                if (rvNum != null && rvNum != '' && rvNum != 'null') { return rvNum; }
                var spcId = Trim(Text($feature.Spc_ID_Num));
                if (spcId != null && spcId != '' && spcId != 'null') { return spcId; }
                return '';
              `
            },
            labelPlacement: 'center-center',
            symbol: {
              type: 'text',
              color: [30, 30, 30, 255],
              haloColor: [255, 255, 255, 255],
              haloSize: 1.5,
              font: { size: 9, family: 'Arial', weight: 'normal' }
            },
            minScale: 1200,
            maxScale: 0,
            deconflictionStrategy: 'none'
          }
        ]
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
      sources: [
        {
          type: 'feature',
          id: definitions.BIKE_DISMOUNT_ZONES.layerId,
          title: definitions.BIKE_DISMOUNT_ZONES.name,
          url: definitions.BIKE_DISMOUNT_ZONES.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.BIKE_DISMOUNT_ZONES.popupComponent,
          popupData: {
            name: '{attributes.Name}',
            description: '<strong>Notes</strong>: {attributes.Bike_Notes}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'feature',
          id: definitions.CITY_BIKE_LANES_ROUTES.layerId,
          title: definitions.CITY_BIKE_LANES_ROUTES.name,
          url: definitions.CITY_BIKE_LANES_ROUTES.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.CITY_BIKE_LANES_ROUTES.popupComponent,
          popupData: {
            name: '{attributes.Type}',
            description: '<strong>Location</strong>: {attributes.Loc}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'feature',
          id: definitions.CAMPUS_BIKE_LANES.layerId,
          title: definitions.CAMPUS_BIKE_LANES.name,
          url: definitions.CAMPUS_BIKE_LANES.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.CAMPUS_BIKE_LANES.popupComponent,
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
          id: definitions.BIKE_FIX_STATIONS.layerId,
          title: definitions.BIKE_FIX_STATIONS.name,
          url: definitions.BIKE_FIX_STATIONS.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.BIKE_FIX_STATIONS.popupComponent,
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
          id: definitions.BIKE_RACKS_MAP.layerId,
          title: definitions.BIKE_RACKS_MAP.name,
          url: definitions.BIKE_RACKS_MAP.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.BIKE_RACKS_MAP.popupComponent,
          popupData: {
            name: '{attributes.Type}',
            description:
              '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' +
              '<strong>Notes</strong>: {attributes.BR_Notes}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'feature',
          id: definitions.EV_CHARGE_STATIONS.layerId,
          title: definitions.EV_CHARGE_STATIONS.name,
          url: definitions.EV_CHARGE_STATIONS.url,
          listMode: 'show',
          visible: true,
          popupComponent: definitions.EV_CHARGE_STATIONS.popupComponent,
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
        }
      ],
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
      id: definitions.SINGLE_OCCUPANCY_RESTROOMS.layerId,
      title: definitions.SINGLE_OCCUPANCY_RESTROOMS.name,
      url: definitions.SINGLE_OCCUPANCY_RESTROOMS.url,
      popupComponent: definitions.SINGLE_OCCUPANCY_RESTROOMS.popupComponent,
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
