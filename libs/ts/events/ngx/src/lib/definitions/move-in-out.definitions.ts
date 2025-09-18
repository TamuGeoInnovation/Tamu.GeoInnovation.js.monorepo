import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MOVE_IN_OUT_LAYERS {
  BUILDINGS = 'move-in-out-buildings',
  CONSTRUCTION = 'move-in-out-construction',
  POINTS_OF_INTEREST = 'move-in-out-pois',
  LACTATION_ROOMS = 'move-in-out-lactation-rooms',
  SURFACE_LOTS = 'move-in-out-surface-lots',
  VISITOR_PARKING = 'move-in-out-visitor-parking',
  TRANSPORTATION_PARKING = 'move-in-out-transportation-parking',
  ACCESSIBLE_ENTRANCES = 'move-in-out-accessible-entrances',
  BIKE_RACKS = 'move-in-out-bike-racks',
  BIKE_LOCATIONS = 'move-in-out-bike-locations',
  MOVE_IN_PARKING_LOTS = 'move-in-out-parking-lots',
  MOVE_IN_OUT_CHECKIN = 'move-in-out-checkin',
  MOVE_IN_OUT_STREET_PARKING = 'move-in-out-street-parking'
}

const basemapUrl = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer';
const inforUrl = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer';
const accessibleUrl = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0';
const constructionUrl = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer';
const tsMainUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer';
const bikeRacksUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3';
const bikeLocationsUrl = 'https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson';
const moveInOutUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer';

export const MoveInOutDefinitions = {
  BUILDINGS: {
    id: MOVE_IN_OUT_LAYERS.BUILDINGS,
    layerId: MOVE_IN_OUT_LAYERS.BUILDINGS,
    name: 'Residence Halls',
    url: `${basemapUrl}/1`
  },
  CONSTRUCTION: {
    id: MOVE_IN_OUT_LAYERS.CONSTRUCTION,
    layerId: MOVE_IN_OUT_LAYERS.CONSTRUCTION,
    name: 'Construction Zone',
    url: `${constructionUrl}`
  },
  POINTS_OF_INTEREST: {
    id: MOVE_IN_OUT_LAYERS.POINTS_OF_INTEREST,
    layerId: MOVE_IN_OUT_LAYERS.POINTS_OF_INTEREST,
    name: 'Points of Interest',
    url: `${inforUrl}/0`
  },
  LACTATION_ROOMS: {
    id: MOVE_IN_OUT_LAYERS.LACTATION_ROOMS,
    layerId: MOVE_IN_OUT_LAYERS.LACTATION_ROOMS,
    name: 'Lactation Rooms',
    url: `${inforUrl}/2`
  },
  SURFACE_LOTS: {
    id: MOVE_IN_OUT_LAYERS.SURFACE_LOTS,
    layerId: MOVE_IN_OUT_LAYERS.SURFACE_LOTS,
    name: 'Surface Lots',
    url: `${basemapUrl}/9`
  },
  VISITOR_PARKING: {
    id: MOVE_IN_OUT_LAYERS.VISITOR_PARKING,
    layerId: MOVE_IN_OUT_LAYERS.VISITOR_PARKING,
    name: 'Visitor Parking',
    url: `${inforUrl}/3`
  },
  TRANSPORTATION_PARKING: {
    id: MOVE_IN_OUT_LAYERS.TRANSPORTATION_PARKING,
    layerId: MOVE_IN_OUT_LAYERS.TRANSPORTATION_PARKING,
    name: 'Transportation Parking',
    url: `${tsMainUrl}/6`
  },
  ACCESSIBLE_ENTRANCES: {
    id: MOVE_IN_OUT_LAYERS.ACCESSIBLE_ENTRANCES,
    layerId: MOVE_IN_OUT_LAYERS.ACCESSIBLE_ENTRANCES,
    name: 'Accessible Entrances',
    url: `${accessibleUrl}`
  },
  BIKE_RACKS: {
    id: MOVE_IN_OUT_LAYERS.BIKE_RACKS,
    layerId: MOVE_IN_OUT_LAYERS.BIKE_RACKS,
    name: 'Bike Racks',
    url: `${bikeRacksUrl}`
  },
  BIKE_LOCATIONS: {
    id: MOVE_IN_OUT_LAYERS.BIKE_LOCATIONS,
    layerId: MOVE_IN_OUT_LAYERS.BIKE_LOCATIONS,
    name: 'VeoRide Bikes',
    url: `${bikeLocationsUrl}`
  },
  MOVE_IN_PARKING_LOTS: {
    id: MOVE_IN_OUT_LAYERS.MOVE_IN_PARKING_LOTS,
    layerId: MOVE_IN_OUT_LAYERS.MOVE_IN_PARKING_LOTS,
    name: 'Move-In Parking Lots',
    url: `${moveInOutUrl}/6`
  },
  MOVE_IN_OUT_CHECKIN: {
    id: MOVE_IN_OUT_LAYERS.MOVE_IN_OUT_CHECKIN,
    layerId: MOVE_IN_OUT_LAYERS.MOVE_IN_OUT_CHECKIN,
    name: 'Move-In Check-In',
    url: `${moveInOutUrl}/2`
  },
  MOVE_IN_OUT_STREET_PARKING: {
    id: MOVE_IN_OUT_LAYERS.MOVE_IN_OUT_STREET_PARKING,
    layerId: MOVE_IN_OUT_LAYERS.MOVE_IN_OUT_STREET_PARKING,
    name: 'Move-In Street Parking',
    url: `${moveInOutUrl}/5`
  }
};

export const MoveInOutColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveInOutDefinitions.BUILDINGS.id,
    title: MoveInOutDefinitions.BUILDINGS.name,
    url: MoveInOutDefinitions.BUILDINGS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.BldgAbbr',
      description: 'attributes.BldgName'
    },
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.MOVE_IN_PARKING_LOTS.id,
    title: MoveInOutDefinitions.MOVE_IN_PARKING_LOTS.name,
    url: MoveInOutDefinitions.MOVE_IN_PARKING_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Note'
    },
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.MOVE_IN_OUT_CHECKIN.id,
    title: MoveInOutDefinitions.MOVE_IN_OUT_CHECKIN.name,
    url: MoveInOutDefinitions.MOVE_IN_OUT_CHECKIN.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.MOVE_IN_OUT_STREET_PARKING.id,
    title: MoveInOutDefinitions.MOVE_IN_OUT_STREET_PARKING.name,
    url: MoveInOutDefinitions.MOVE_IN_OUT_STREET_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.CONSTRUCTION.id,
    title: MoveInOutDefinitions.CONSTRUCTION.name,
    url: MoveInOutDefinitions.CONSTRUCTION.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.POINTS_OF_INTEREST.id,
    title: MoveInOutDefinitions.POINTS_OF_INTEREST.name,
    url: MoveInOutDefinitions.POINTS_OF_INTEREST.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.LACTATION_ROOMS.id,
    title: MoveInOutDefinitions.LACTATION_ROOMS.name,
    url: MoveInOutDefinitions.LACTATION_ROOMS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.SURFACE_LOTS.id,
    title: MoveInOutDefinitions.SURFACE_LOTS.name,
    url: MoveInOutDefinitions.SURFACE_LOTS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.VISITOR_PARKING.id,
    title: MoveInOutDefinitions.VISITOR_PARKING.name,
    url: MoveInOutDefinitions.VISITOR_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.TRANSPORTATION_PARKING.id,
    title: MoveInOutDefinitions.TRANSPORTATION_PARKING.name,
    url: MoveInOutDefinitions.TRANSPORTATION_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.ACCESSIBLE_ENTRANCES.id,
    title: MoveInOutDefinitions.ACCESSIBLE_ENTRANCES.name,
    url: MoveInOutDefinitions.ACCESSIBLE_ENTRANCES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInOutDefinitions.BIKE_RACKS.id,
    title: MoveInOutDefinitions.BIKE_RACKS.name,
    url: MoveInOutDefinitions.BIKE_RACKS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.Description'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'geojson',
    id: MoveInOutDefinitions.BIKE_LOCATIONS.id,
    title: MoveInOutDefinitions.BIKE_LOCATIONS.name,
    url: MoveInOutDefinitions.BIKE_LOCATIONS.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'VeoRide Bike',
      description: 'Available VeoRide bike location'
    },
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  }
];

export const MoveInOutConfiguration: EventConfiguration = {
  id: 'move-in-out',
  name: 'Move-In/Move-Out',
  applicationName: 'Move-In/Move-Out Transportation Map',
  shortApplicationName: 'Move-In/Out Map',
  introductionText: 'Welcome to the transportation and parking information for',
  eventDates: [
    new Date(2025, 7, 19), // August 19, 2025
    new Date(2025, 7, 20), // August 20, 2025
    new Date(2025, 7, 21), // August 21, 2025
    new Date(2025, 7, 22), // August 22, 2025
    new Date(2025, 7, 23), // August 23, 2025
    new Date(2025, 7, 24) // August 24, 2025
  ],
  mapCenter: [-96.3344, 30.6187], // Texas A&M University coordinates
  zoom: 16,
  toast: {
    id: 'move-in-out-notification',
    title: 'Move-In/Move-Out Information',
    message: 'Plan your move-in or move-out using the transportation and parking information provided on this map.',
    acknowledge: false
  }
};

export const MoveInOutOptions: SpecialEventOptions = [
  {
    value: 'accessible',
    label: 'Accessible Options',
    description: 'Show accessible parking and entrances',
    shortDescription: 'Show accessible features',
    choices: [
      {
        value: 'show-accessible',
        label: 'Show Accessible Features'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_OUT_LAYERS.ACCESSIBLE_ENTRANCES,
          conversions: [
            {
              input: 'show-accessible',
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

export const MoveInOutEvent: ISpecialEventRoot = {
  configuration: MoveInOutConfiguration,
  options: MoveInOutOptions,
  sources: MoveInOutColdLayerSources,
  references: MOVE_IN_OUT_LAYERS,
  discover: {
    id: MoveInOutConfiguration.id,
    name: MoveInOutConfiguration.name,
    description: 'Transportation and parking information for residence hall move-in and move-out days.',
    source: 'internal',
    type: 'event',
    keywords: ['move-in', 'move-out', 'residence halls', 'parking', 'transportation', 'dorms']
  }
};
