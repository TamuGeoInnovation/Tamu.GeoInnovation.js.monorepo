import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { commonSymbols } from './common.definitions';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

export enum PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS {
  GENERAL_PARKING_GROUP = 'phys-eng-festival-general-parking-group',
  GENERAL_PARKING = 'phys-eng-festival-general-parking',
  GENERAL_PARKING_PEDESTRIAN_PATH = 'phys-eng-festival-general-parking-pedestrian-path',
  EASTBOUND_UNIVERSITY_GROUP = 'phys-eng-festival-eastbound-university-group',
  EASTBOUND_BUS_PARKING = 'phys-eng-festival-eastbound-bus-parking',
  EASTBOUND_BUS_DROPOFF = 'phys-eng-festival-eastbound-bus-dropoff',
  EASTBOUND_BUS_ROUTE = 'phys-eng-festival-eastbound-bus-route',
  EASTBOUND_PEDESTRIAN_PATH = 'phys-eng-festival-eastbound-pedestrian-path',
  WESTBOUND_UNIVERSITY_GROUP = 'phys-eng-festival-westbound-university-group',
  WESTBOUND_BUS_PARKING = 'phys-eng-festival-westbound-bus-parking',
  WESTBOUND_BUS_DROPOFF = 'phys-eng-festival-westbound-bus-dropoff',
  WESTBOUND_BUS_ROUTE = 'phys-eng-festival-westbound-bus-route',
  WESTBOUND_PEDESTRIAN_PATH = 'phys-eng-festival-westbound-pedestrian-path'
}

const eventUrl = Connections.physicsFestUrl;

type AutoCastSimpleLineSymbol = { type: 'simple-line' } & esri.SimpleLineSymbolProperties;

// The three renderers below are overrides. The MapServer and its portal item publish no arrow symbol
// (the service flattens it to a plain 14-pt line); remove when the service is republished as a hosted
// view with the arrows (#1803).

/** Draws every feature of a line layer with one symbol. */
function arrowLineNative(symbol: AutoCastSimpleLineSymbol): NonNullable<FeatureLayerSourceProperties['native']> {
  return { outFields: ['*'], renderer: { type: 'simple', symbol } };
}

/** A bus route: a 3.5-pt line in the given colour with an arrowhead where it ends. */
function busRouteArrow(color: string): AutoCastSimpleLineSymbol {
  return {
    type: 'simple-line',
    color,
    width: 3.5,
    marker: { style: 'arrow', color, placement: 'end' }
  };
}

const GREEN_ARROW_LINE_NATIVE = arrowLineNative(commonSymbols.GREEN_ARROW as AutoCastSimpleLineSymbol);

const EASTBOUND_BUS_ROUTE_LINE_NATIVE = arrowLineNative(busRouteArrow('blue'));

const WESTBOUND_BUS_ROUTE_LINE_NATIVE = arrowLineNative(busRouteArrow('red'));

export const PhysEngFestDefinitions = {
  GENERAL_PARKING_GROUP: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING_GROUP,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING_GROUP,
    name: 'General Parking',
    url: `${eventUrl}/0`
  },
  GENERAL_PARKING: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING,
    name: 'Physics/Engineering Festival - General Parking',
    url: `${eventUrl}/1`
  },
  GENERAL_PARKING_PEDESTRIAN_PATH: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING_PEDESTRIAN_PATH,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING_PEDESTRIAN_PATH,
    name: 'Pedestrian Path - General Parking',
    url: `${eventUrl}/2`
  },
  EASTBOUND_UNIVERSITY_GROUP: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_UNIVERSITY_GROUP,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_UNIVERSITY_GROUP,
    name: 'Buses Entering from Eastbound University Dr',
    url: `${eventUrl}/3`
  },
  EASTBOUND_BUS_PARKING: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_PARKING,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_PARKING,
    name: 'Physics/Engineering Festival - Bus Parking',
    url: `${eventUrl}/4`
  },
  EASTBOUND_BUS_DROPOFF: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_DROPOFF,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_DROPOFF,
    name: 'Eastbound Bus Drop Off/Pick Up Location',
    url: `${eventUrl}/5`
  },
  EASTBOUND_BUS_ROUTE: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_ROUTE,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_BUS_ROUTE,
    name: 'Bus Route - Buses Entering from Eastbound University Dr',
    url: `${eventUrl}/6`
  },
  EASTBOUND_PEDESTRIAN_PATH: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_PEDESTRIAN_PATH,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_PEDESTRIAN_PATH,
    name: 'Pedestrian Path - Buses Entering from Eastbound University Dr',
    url: `${eventUrl}/7`
  },
  WESTBOUND_UNIVERSITY_GROUP: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_UNIVERSITY_GROUP,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_UNIVERSITY_GROUP,
    name: 'Buses Entering from Westbound University Dr',
    url: `${eventUrl}/8`
  },
  WESTBOUND_BUS_PARKING: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_PARKING,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_PARKING,
    name: 'Physics/Engineering Festival - Bus Parking',
    url: `${eventUrl}/9`
  },
  WESTBOUND_BUS_DROPOFF: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_DROPOFF,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_DROPOFF,
    name: 'Westbound Bus Drop Off/Pick Up Location',
    url: `${eventUrl}/10`
  },
  WESTBOUND_BUS_ROUTE: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_ROUTE,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_BUS_ROUTE,
    name: 'Bus Route - Buses Entering from Westbound University',
    url: `${eventUrl}/11`
  },
  WESTBOUND_PEDESTRIAN_PATH: {
    id: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_PEDESTRIAN_PATH,
    layerId: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_PEDESTRIAN_PATH,
    name: 'Pedestrian Path - Buses Entering from Westbound University',
    url: `${eventUrl}/12`
  }
};

const PhysicsAndEngineeringFestivalLayerReferences: Record<string, string> = {
  GENERAL_PARKING_GROUP: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.GENERAL_PARKING_GROUP,
  EASTBOUND_UNIVERSITY_GROUP: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.EASTBOUND_UNIVERSITY_GROUP,
  WESTBOUND_UNIVERSITY_GROUP: PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS.WESTBOUND_UNIVERSITY_GROUP
};

export const PhysEngFestivalColdLayerSources: LayerSource[] = [
  {
    type: 'group',
    id: PhysEngFestDefinitions.GENERAL_PARKING_GROUP.id,
    // A group made here has no service to name it, so without a title it is listed with none (#1803).
    title: PhysEngFestDefinitions.GENERAL_PARKING_GROUP.name,
    visible: true,
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: PhysEngFestDefinitions.GENERAL_PARKING.id,
        url: PhysEngFestDefinitions.GENERAL_PARKING.url,
        popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.GENERAL_PARKING_PEDESTRIAN_PATH.id,
        title: PhysEngFestDefinitions.GENERAL_PARKING_PEDESTRIAN_PATH.name,
        url: PhysEngFestDefinitions.GENERAL_PARKING_PEDESTRIAN_PATH.url,
        popupComponent: EventPopups.MarkdownPopupComponent,
        visible: true,
        listMode: 'show',
        native: GREEN_ARROW_LINE_NATIVE
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  },
  {
    type: 'group',
    id: PhysEngFestDefinitions.EASTBOUND_UNIVERSITY_GROUP.id,
    // A group made here has no service to name it, so without a title it is listed with none (#1803).
    title: PhysEngFestDefinitions.EASTBOUND_UNIVERSITY_GROUP.name,
    visible: false,
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: PhysEngFestDefinitions.EASTBOUND_BUS_PARKING.id,
        url: PhysEngFestDefinitions.EASTBOUND_BUS_PARKING.url,
        popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.EASTBOUND_BUS_ROUTE.id,
        url: PhysEngFestDefinitions.EASTBOUND_BUS_ROUTE.url,
        popupComponent: EventPopups.MarkdownPopupComponent,
        visible: true,
        listMode: 'show',
        native: EASTBOUND_BUS_ROUTE_LINE_NATIVE
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.EASTBOUND_PEDESTRIAN_PATH.id,
        url: PhysEngFestDefinitions.EASTBOUND_PEDESTRIAN_PATH.url,
        popupComponent: EventPopups.MarkdownPopupComponent,
        visible: true,
        listMode: 'show',
        native: GREEN_ARROW_LINE_NATIVE
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.EASTBOUND_BUS_DROPOFF.id,
        url: PhysEngFestDefinitions.EASTBOUND_BUS_DROPOFF.url,
        popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  },
  {
    type: 'group',
    id: PhysEngFestDefinitions.WESTBOUND_UNIVERSITY_GROUP.id,
    // A group made here has no service to name it, so without a title it is listed with none (#1803).
    title: PhysEngFestDefinitions.WESTBOUND_UNIVERSITY_GROUP.name,
    visible: false,
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: PhysEngFestDefinitions.WESTBOUND_BUS_PARKING.id,
        url: PhysEngFestDefinitions.WESTBOUND_BUS_PARKING.url,
        popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.WESTBOUND_BUS_ROUTE.id,
        url: PhysEngFestDefinitions.WESTBOUND_BUS_ROUTE.url,
        popupComponent: EventPopups.MarkdownPopupComponent,
        visible: true,
        listMode: 'show',
        native: WESTBOUND_BUS_ROUTE_LINE_NATIVE
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.WESTBOUND_PEDESTRIAN_PATH.id,
        url: PhysEngFestDefinitions.WESTBOUND_PEDESTRIAN_PATH.url,
        popupComponent: EventPopups.MarkdownPopupComponent,
        visible: true,
        listMode: 'show',
        native: GREEN_ARROW_LINE_NATIVE
      },
      {
        type: 'feature',
        id: PhysEngFestDefinitions.WESTBOUND_BUS_DROPOFF.id,
        url: PhysEngFestDefinitions.WESTBOUND_BUS_DROPOFF.url,
        popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
        visible: true,
        listMode: 'show',
        native: {
          outFields: ['*']
        }
      }
    ],
    native: {
      listMode: 'hide-children'
    }
  }
];

export const PhysicsAndEngineeringFestivalConfiguration: EventConfiguration = {
  id: 'phys-eng-fest',
  name: 'Physics and Engineering Festival',
  applicationName: 'Physics and Engineering Festival Transportation Map',
  shortApplicationName: 'Physics and Engineering Festival Map',
  introductionText: 'Get the best parking information for the Physics and Engineering Festival.',
  eventDates: ['2026-03-28'],
  toast: {
    id: 'phys-eng-fest-notification-2026',
    title: 'Physics and Engineering Festival Map Available',
    message:
      'Visiting the Physics and Engineering Festival? Click me to open the transportation map for parking, bus drop-off, and pedestrian route information.',
    imgUrl: './assets/images/icons/transportation/Parking.png',
    imgAltText: 'Physics and Engineering Festival Parking Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/phys-eng-fest'
    }
  },
  mapCenter: [-96.33771, 30.62143],
  zoom: 17,
  legendAllowVisibilityToggle: true,
  legendCombineChildrenUnderPrimary: true
};

export const PhysicsAndEngineeringFestivalOptions: SpecialEventOptions = [];

export const PhysicsAndEngineeringFestivalTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: PhysicsAndEngineeringFestivalConfiguration,
  options: PhysicsAndEngineeringFestivalOptions,
  sources: PhysEngFestivalColdLayerSources,
  references: PhysicsAndEngineeringFestivalLayerReferences,
  discover: {
    id: PhysicsAndEngineeringFestivalConfiguration.id,
    name: PhysicsAndEngineeringFestivalConfiguration.name,
    description: 'Transportation and parking information for Physics and Engineering Festival.',
    source: 'internal',
    type: 'event',
    columnKey: 'spring',
    keywords: ['physics', 'engineering', 'festival', 'parking', 'transportation']
  }
};
