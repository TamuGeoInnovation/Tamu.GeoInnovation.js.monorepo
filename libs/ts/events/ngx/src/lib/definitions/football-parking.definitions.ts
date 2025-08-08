import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum FOOTBALL_PARKING_LAYERS {
  FP_PARKING_LOTS = 'football-parking-lots',
  FP_STREET_GRASS_AREAS = 'football-street-grass-areas',
  FP_GAMEDAY_SHUTTLE = 'football-gameday-shuttle',
  FP_POIS = 'football-pois',
  TS_BIKE_LANES = 'ts-bike-lanes',
  TS_CITY_BIKE_LANES_ROUTES = 'ts-city-bike-lanes-routes',
  TS_BIKE_DISMOUNT_ZONES = 'ts-bike-dismount-zones',
  TS_BIKE_RACKS = 'ts-bike-racks'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TSFootball/MapServer';
const bikeLayersUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/BikeMap/MapServer';

const FootballParkingEventDefinitions = {
  FP_POIS: {
    id: FOOTBALL_PARKING_LAYERS.FP_POIS,
    layerId: 2,
    name: 'Gameday Points of Interest',
    url: `${eventUrl}/2`
  },
  FP_PARKING_LOTS: {
    id: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    layerId: 5,
    name: 'Football Parking Lots',
    url: `${eventUrl}/5`
  },
  FP_STREET_GRASS_AREAS: {
    id: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    layerId: 6,
    name: 'Street/Grass Areas',
    url: `${eventUrl}/6`
  },
  FP_GAMEDAY_SHUTTLE: {
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_SHUTTLE,
    layerId: 7,
    name: 'Game Day Shuttle',
    url: `${eventUrl}/7`
  },
  TS_BIKE_RACKS: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_RACKS,
    layerId: 8,
    name: 'Bike Racks',
    url: `${bikeLayersUrl}/0`
  },
  TS_BIKE_LANES: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_LANES,
    layerId: 9,
    name: 'Bike Lanes',
    url: `${bikeLayersUrl}/2`
  },
  TS_CITY_BIKE_LANES_ROUTES: {
    id: FOOTBALL_PARKING_LAYERS.TS_CITY_BIKE_LANES_ROUTES,
    layerId: 9,
    name: 'City Bike Lanes and Routes',
    url: `${bikeLayersUrl}/3`
  },
  TS_BIKE_DISMOUNT_ZONES: {
    id: FOOTBALL_PARKING_LAYERS.TS_BIKE_DISMOUNT_ZONES,
    layerId: 10,
    name: 'Bike Dismount Zones',
    url: `${bikeLayersUrl}/5`
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
      outFields: ['*']
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
      description: 'attributes.Description'
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
  }
];

export const FootballParkingConfiguration: EventConfiguration = {
  id: 'gameday-parking',
  name: 'Gameday Transportation',
  applicationName: 'Gameday Transportation Map',
  shortApplicationName: 'Gameday Map',
  introductionText: 'Get the best transportation and parking information for game days.',
  eventDates: [],
  mapCenter: [-96.34344, 30.61011],
  zoom: 16
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
      // TODO: No data layers for this option
      // {
      //   value: TransportTypes.RIDE_SHARE,
      //   label: 'Ride Share'
      // },
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
        }
      ]
    }
  }
];

export const FootballParkingEvent: ISpecialEventRoot = {
  configuration: FootballParkingConfiguration,
  options: FootballParkingOptions,
  sources: FootballParkingColdLayerSources,
  references: FOOTBALL_PARKING_LAYERS
};
