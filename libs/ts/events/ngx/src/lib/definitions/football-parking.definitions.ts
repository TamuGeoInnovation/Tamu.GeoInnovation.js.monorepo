import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum FOOTBALL_PARKING_LAYERS {
  FP_POIS = 'football-pois',
  FP_PARKING_LOTS = 'football-parking-lots',
  FP_STREET_GRASS_AREAS = 'football-street-grass-areas',
  TS_BIKE_DISMOUNT_ZONES = 'ts-bike-dismount-zones',
  TS_BIKE_LANES = 'ts-bike-lanes',
  TS_CITY_BIKE_LANES_ROUTES = 'ts-city-bike-lanes-routes',
  TS_BIKE_RACKS = 'ts-bike-racks',
  TS_SHUTTLE_STOPS_ON = 'ts-shuttle-stops-on',
  TS_SHUTTLE_STOPS_OFF = 'ts-shuttle-stops-off',
  TS_SHUTTLE_ROUTES_ON = 'ts-shuttle-routes-on',
  TS_SHUTTLE_ROUTES_OFF = 'ts-shuttle-routes-off',
  FP_GAMEDAY_SHUTTLE = 'football-gameday-shuttle'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TSFootball/MapServer';
const bikeLayersUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/BikeMap/MapServer';
const shuttleLayersUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Ftbl_Gameday_Shuttles/MapServer';

const FootballParkingEventDefinitions = {
  FP_POIS: {
    id: FOOTBALL_PARKING_LAYERS.FP_POIS,
    layerId: FOOTBALL_PARKING_LAYERS.FP_POIS,
    name: 'Gameday Points of Interest',
    url: `${eventUrl}/2`
  },
  FP_PARKING_LOTS: {
    id: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    layerId: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    name: 'Football Parking Lots',
    url: `${eventUrl}/5`
  },
  FP_STREET_GRASS_AREAS: {
    id: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    layerId: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    name: 'Street/Grass Areas',
    url: `${eventUrl}/6`
  },
  FP_GAMEDAY_SHUTTLE: {
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_SHUTTLE,
    layerId: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_SHUTTLE,
    name: 'Downtown Bryan Shuttle Stop',
    url: `${eventUrl}/7`
  },
  TS_BIKE_RACKS: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_RACKS,
    layerId: FOOTBALL_PARKING_LAYERS.TS_BIKE_RACKS,
    name: 'Bike Racks',
    url: `${bikeLayersUrl}/0`
  },
  TS_BIKE_LANES: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_LANES,
    layerId: FOOTBALL_PARKING_LAYERS.TS_BIKE_LANES,
    name: 'Bike Lanes',
    url: `${bikeLayersUrl}/2`
  },
  TS_CITY_BIKE_LANES_ROUTES: {
    id: FOOTBALL_PARKING_LAYERS.TS_CITY_BIKE_LANES_ROUTES,
    layerId: FOOTBALL_PARKING_LAYERS.TS_CITY_BIKE_LANES_ROUTES,
    name: 'City Bike Lanes and Routes',
    url: `${bikeLayersUrl}/3`
  },
  TS_BIKE_DISMOUNT_ZONES: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_DISMOUNT_ZONES,
    layerId: FOOTBALL_PARKING_LAYERS.TS_BIKE_DISMOUNT_ZONES,
    name: 'Bike Dismount Zones',
    url: `${bikeLayersUrl}/5`
  },
  TS_SHUTTLE_STOPS_ON: {
    id: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_ON,
    layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_ON,
    name: 'On-Campus Shuttle Stops',
    url: `${shuttleLayersUrl}/0`
  },
  TS_SHUTTLE_STOPS_OFF: {
    id: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_OFF,
    layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_OFF,
    name: 'Off-Campus Shuttle Stops',
    url: `${shuttleLayersUrl}/0`
  },
  TS_SHUTTLE_ROUTES_ON: {
    id: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_ON,
    layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_ON,
    name: 'On-Campus Shuttle Routes',
    url: `${shuttleLayersUrl}/1`
  },
  TS_SHUTTLE_ROUTES_OFF: {
    id: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_OFF,
    layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_OFF,
    name: 'Off-Campus Shuttle Routes',
    url: `${shuttleLayersUrl}/1`
  }
};

export const FootballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_POIS.id,
    title: FootballParkingEventDefinitions.FP_POIS.name,
    url: FootballParkingEventDefinitions.FP_POIS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Notes',
      description: 'attributes.Notes_1'
    },
    native: {
      outFields: ['*'],
      visible: false,
      minScale: 0
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_PARKING_LOTS.id,
    title: FootballParkingEventDefinitions.FP_PARKING_LOTS.name,
    url: FootballParkingEventDefinitions.FP_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    native: {
      outFields: ['*'],
      labelingInfo: [
        {
          // TwelfthMan lots (treat blank or single space as empty; anything else shows second line)
          labelExpressionInfo: {
            expression: '$feature.Name + TextFormatting.NewLine + $feature.TwelfthMan'
          },
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
            type: 'text',
            color: [255, 255, 255, 255],
            haloColor: [0, 0, 0, 255],
            haloSize: 1,
            font: {
              family: 'Arial',
              size: 10,
              style: 'normal',
              weight: 'bold'
            }
          },
          minScale: 9500,
          maxScale: 0,
          where: "TwelfthMan IS NOT NULL AND TRIM(TwelfthMan) <> ''"
        },
        {
          // Non-TwelfthMan lots with a price embedded in Type (e.g. "Public $30")
          labelExpressionInfo: {
            expression:
              "var t=$feature.Type; var p=''; if(t!=null && t!='' && Find('$', t)>-1){ var i=Find('$', t); var seg=Mid(t,i,10); var sp=Find(' ', seg); if(sp>-1){ seg=Left(seg, sp);} var last=Right(seg,1); if(last=='-' || last==':' || last==',' ){ seg=Left(seg, Length(seg)-1);} p=seg; } $feature.Name + IIf(p=='','', ' - '+p);"
          },
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
            type: 'text',
            color: [255, 255, 255, 255],
            haloColor: [0, 0, 0, 255],
            haloSize: 1,
            font: {
              family: 'Arial',
              size: 10,
              style: 'normal',
              weight: 'bold'
            }
          },
          minScale: 9500,
          maxScale: 0,
          where: "(TwelfthMan IS NULL OR TRIM(TwelfthMan) = '') AND Type IS NOT NULL AND Type LIKE '%$%' AND Type <> 'AVP'"
        },
        {
          // Fallback: non-priced, non-TwelfthMan
          labelExpression: '[Name]',
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
            type: 'text',
            color: [255, 255, 255, 255],
            haloColor: [0, 0, 0, 255],
            haloSize: 1,
            font: {
              family: 'Arial',
              size: 10,
              style: 'normal',
              weight: 'bold'
            }
          },
          minScale: 9500,
          maxScale: 0,
          where: "(TwelfthMan IS NULL OR TRIM(TwelfthMan) = '') AND (Type IS NULL OR Type NOT LIKE '%$%' OR Type = 'AVP')"
        }
      ]
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.id,
    title: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.name,
    url: FootballParkingEventDefinitions.FP_STREET_GRASS_AREAS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.AreaName',
      description: 'attributes.aNote'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.id,
    title: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.name,
    url: FootballParkingEventDefinitions.FP_GAMEDAY_SHUTTLE.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RouteName',
      description: 'attributes.Notes_1'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_BIKE_RACKS.id,
    title: FootballParkingEventDefinitions.TS_BIKE_RACKS.name,
    url: FootballParkingEventDefinitions.TS_BIKE_RACKS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.BR_Notes'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_BIKE_LANES.id,
    title: FootballParkingEventDefinitions.TS_BIKE_LANES.name,
    url: FootballParkingEventDefinitions.TS_BIKE_LANES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RouteName',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_CITY_BIKE_LANES_ROUTES.id,
    title: FootballParkingEventDefinitions.TS_CITY_BIKE_LANES_ROUTES.name,
    url: FootballParkingEventDefinitions.TS_CITY_BIKE_LANES_ROUTES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RouteName',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_BIKE_DISMOUNT_ZONES.id,
    title: FootballParkingEventDefinitions.TS_BIKE_DISMOUNT_ZONES.name,
    url: FootballParkingEventDefinitions.TS_BIKE_DISMOUNT_ZONES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RouteName',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_ON.id,
    title: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_ON.name,
    url: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_ON.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.RouteName} ({attributes.RouteNum})'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Campus = 'On'",
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_OFF.id,
    title: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_OFF.name,
    url: FootballParkingEventDefinitions.TS_SHUTTLE_ROUTES_OFF.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.RouteName} ({attributes.RouteNum})'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Campus = 'Off'",
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_ON.id,
    title: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_ON.name,
    url: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_ON.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.StopName}',
      description: 'For route: {attributes.RouteName}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Campus = 'On'",
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_OFF.id,
    title: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_OFF.name,
    url: FootballParkingEventDefinitions.TS_SHUTTLE_STOPS_OFF.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.StopName}',
      description: 'For route: {attributes.RouteName}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Campus = 'Off'",
      visible: false,
      listMode: 'hide'
    }
  }
];

export const FootballParkingConfiguration: EventConfiguration = {
  id: 'gameday-parking',
  name: 'Gameday Transportation',
  applicationName: 'Gameday Transportation Map',
  shortApplicationName: 'Gameday Map',
  introductionText: 'Get the best transportation and parking information for game days.',
  eventDates: ['2025-08-30', '2025-09-06', '2025-09-27', '2025-10-04', '2025-10-11', '2025-11-15', '2025-11-22','2025-12-20'],
  mapCenter: [-96.34344, 30.61011],
  zoom: 16,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  },
  toast: {
    id: 'gameday-parking-notification',
    title: 'Gameday Transportation Map Available',
    message:
      'Attending the game? Click me to open the Gameday Transportation Map to get the best parking and transportation options for game day!',
    imgUrl: './assets/images/icons/sports/Football.png',
    imgAltText: 'Football Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/gameday-parking'
    }
  }
};

enum TransportTypes {
  SHUTTLE = 'shuttle',
  RV = 'rv',
  PERSONAL_VEHICLE = 'personal-vehicle',
  RIDE_SHARE = 'ride-share',
  BIKE = 'bike'
}

export const FootballParkingOptions: SpecialEventOptions = [
  {
    value: 'transport-type',
    label: 'Transportation Type',
    description:
      'To provide you with the most relevant and accurate transportation and parking information, please select your mode of transportation on game day. This will help us tailor the map and information to your needs.',
    shortDescription: 'Transportation Type',
    choices: [
      {
        value: TransportTypes.SHUTTLE,
        label: 'Shuttle'
      },
      {
        value: TransportTypes.RV,
        label: 'RV'
      },
      {
        value: TransportTypes.PERSONAL_VEHICLE,
        label: 'Personal Vehicle'
      },
      {
        value: TransportTypes.BIKE,
        label: 'Bike'
      }
    ],
    effects: {
      layers: [
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_POIS,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              expression: "Notes IN ('Loading Zone', 'Road Closed')"
            },
            {
              input: TransportTypes.RV,
              expression: "Notes NOT IN ('Cashier', 'Disabled', 'GPresale')"
            },
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                visible: false,
                listMode: 'hide'
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              expression: "Type = 'Charter'"
            },
            {
              input: TransportTypes.RV,
              expression: "Type = 'RV'"
            },
            {
              input: TransportTypes.PERSONAL_VEHICLE,
              expression: "Type NOT IN ('RV', 'Charter')"
            },
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                visible: false,
                listMode: 'hide'
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              propOverrides: {
                visible: false
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_SHUTTLE,
          conversions: [
            {
              input: TransportTypes.RV,
              propOverrides: {
                visible: false
              }
            },
            {
              input: TransportTypes.PERSONAL_VEHICLE,
              propOverrides: {
                visible: false
              }
            },
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                visible: false,
                listMode: 'hide'
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_BIKE_LANES,
          conversions: [
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_CITY_BIKE_LANES_ROUTES,
          conversions: [
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_BIKE_DISMOUNT_ZONES,
          conversions: [
            {
              input: TransportTypes.BIKE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_ON,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_ROUTES_OFF,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_ON,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.TS_SHUTTLE_STOPS_OFF,
          conversions: [
            {
              input: TransportTypes.SHUTTLE,
              propOverrides: {
                native: { visible: true, listMode: 'show' }
              }
            }
          ]
        }
      ]
    }
  }
];

export const FootballParkingEvent: ISpecialEventRoot = {
  configuration: FootballParkingConfiguration,
  options: FootballParkingOptions,
  sources: FootballParkingColdLayerSources,
  references: FOOTBALL_PARKING_LAYERS,
  discover: {
    id: FootballParkingConfiguration.id,
    name: FootballParkingConfiguration.name,
    description: 'Transportation and parking information for football game days.',
    source: 'internal',
    type: 'event',
    keywords: ['football', 'gameday', 'parking', 'shuttles', 'transportation', 'bike']
  }
};
