import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MOVE_IN_LAYERS {
  MOVE_IN_POI = 'Move-In Points of Interest',
  MOVE_IN_STREETS = 'Move-In Streets',
  MOVE_IN_LOTS = 'Move-In Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/FallMoveInParking/MapServer';

export const MoveInDefinitions = {
  MOVE_IN_POI: {
    id: MOVE_IN_LAYERS.MOVE_IN_POI,
    layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
    name: 'Move-In Points of Interest',
    url: `${eventUrl}/0`
  },
  MOVE_IN_STREETS: {
    id: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    name: 'Move-In Streets',
    url: `${eventUrl}/1`
  },
  MOVE_IN_LOTS: {
    id: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    name: 'Move-In Lots',
    url: `${eventUrl}/2`
  }
};

export const MoveInColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_STREETS.id,
    title: MoveInDefinitions.MOVE_IN_STREETS.name,
    url: MoveInDefinitions.MOVE_IN_STREETS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_LOTS.id,
    title: MoveInDefinitions.MOVE_IN_LOTS.name,
    url: MoveInDefinitions.MOVE_IN_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      /**
       * Notes requested from column: MoveInN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.MoveInN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_POI.id,
    title: MoveInDefinitions.MOVE_IN_POI.name,
    url: MoveInDefinitions.MOVE_IN_POI.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: {
        field: 'Note',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const MoveInConfiguration: EventConfiguration = {
  id: 'move-in',
  name: 'Move In',
  applicationName: 'Move In Transportation Map',
  introductionText:
    'Get the best transportation and parking information for Move In Day. Use the builder to choose which map layers you want before opening the map.',
  shortApplicationName: 'Move In Map',
  mapCenter: [-96.34358, 30.61035],
  eventDates: [],
  zoom: 16,
  builderStartStep: 'review'
};

enum MoveInBuilderOptions {
  LOTS = 'move-in-lots',
  STREETS = 'move-in-streets',
  POINTS_OF_INTEREST = 'move-in-poi',
  LOTS_FILTER = 'move-in-lots-filter',
  STREETS_FILTER = 'move-in-streets-filter',
  POI_FILTER = 'move-in-poi-filter'
}

enum MoveInOptionChoices {
  SHOW = 'show',
  HIDE = 'hide'
}

enum MoveInStreetFilterChoices {
  ALL = 'all-street-types',
  DISABLED_ONLY = 'street-disabled',
  DROP_OFF_AUG_15_18 = 'street-drop-off-aug-15-18',
  DROP_OFF_WEEKENDS = 'street-drop-off-weekends',
  NO_MOVE_IN_PARKING = 'street-no-move-in-parking'
}

enum MoveInLotFilterChoices {
  ALL = 'all-lot-types',
  WEEKEND_FREE = 'lot-weekend-free',
  WEEKEND_ONE_HOUR = 'lot-weekend-one-hour',
  ONE_HOUR_LOT_PERMIT_AFTER_ONE_HOUR = 'lot-one-hour-permit-after-one-hour',
  FREE_AUG_19_23 = 'lot-free-aug-19-23',
  ONE_HOUR_DROP_OFF_AUG_19_24 = 'lot-one-hour-drop-off-aug-19-24',
  DISABLED_ONLY = 'lot-disabled',
  LOT_122 = 'lot-122',
  FREE_AUG_19_24 = 'lot-free-aug-19-24',
  PAID_VISITOR = 'lot-paid-visitor',
  NO_MOVE_IN_PARKING = 'lot-no-move-in-parking',
  FREE_AUG_22_23 = 'lot-free-aug-22-23'
}

enum MoveInPoiFilterChoices {
  ALL = 'all-poi-types',
  DINING = 'poi-dining',
  RECYCLE = 'poi-recycle',
  NO_PARKING = 'poi-no-parking',
  INFO = 'poi-info',
  ENGRAVING = 'poi-engraving',
  CHECK_IN = 'poi-check-in'
}

export const MoveInOptions: SpecialEventOptions = [
  {
    value: MoveInBuilderOptions.LOTS,
    label: 'Move-In Lots',
    shortDescription: 'Move-In Lots',
    description: 'Show or hide Move-In Lots on the map.',
    choices: [
      {
        value: MoveInOptionChoices.SHOW,
        label: 'Show'
      },
      {
        value: MoveInOptionChoices.HIDE,
        label: 'Hide'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
          conversions: [
            {
              input: MoveInOptionChoices.SHOW,
              propOverrides: {
                visible: true
              }
            },
            {
              input: MoveInOptionChoices.HIDE,
              propOverrides: {
                visible: false
              }
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.STREETS,
    label: 'Move-In Streets',
    shortDescription: 'Move-In Streets',
    description: 'Show or hide Move-In Streets on the map.',
    choices: [
      {
        value: MoveInOptionChoices.SHOW,
        label: 'Show'
      },
      {
        value: MoveInOptionChoices.HIDE,
        label: 'Hide'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
          conversions: [
            {
              input: MoveInOptionChoices.SHOW,
              propOverrides: {
                visible: true
              }
            },
            {
              input: MoveInOptionChoices.HIDE,
              propOverrides: {
                visible: false
              }
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.POINTS_OF_INTEREST,
    label: 'Points of Interest',
    shortDescription: 'Points of Interest',
    description: 'Show or hide Move-In points of interest on the map.',
    choices: [
      {
        value: MoveInOptionChoices.SHOW,
        label: 'Show'
      },
      {
        value: MoveInOptionChoices.HIDE,
        label: 'Hide'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
          conversions: [
            {
              input: MoveInOptionChoices.SHOW,
              propOverrides: {
                visible: true
              }
            },
            {
              input: MoveInOptionChoices.HIDE,
              propOverrides: {
                visible: false
              }
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.STREETS_FILTER,
    label: 'Move-In Streets Filter',
    shortDescription: 'Streets Filter',
    description: 'Filter Move-In Streets to only show specific parking/restriction categories.',
    choices: [
      {
        value: MoveInStreetFilterChoices.ALL,
        label: 'All Street Categories'
      },
      {
        value: MoveInStreetFilterChoices.DISABLED_ONLY,
        label: '1-Hour Disabled ONLY Parking'
      },
      {
        value: MoveInStreetFilterChoices.DROP_OFF_AUG_15_18,
        label: '1-Hour Drop Off Zone, Aug 15-18, Space Limited'
      },
      {
        value: MoveInStreetFilterChoices.DROP_OFF_WEEKENDS,
        label: '1-Hour Drop Off Zone, Weekends ONLY'
      },
      {
        value: MoveInStreetFilterChoices.NO_MOVE_IN_PARKING,
        label: 'No Move-In Parking. Lot Specific Permit Required'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
          conversions: [
            {
              input: MoveInStreetFilterChoices.ALL,
              expression: '1=1'
            },
            {
              input: MoveInStreetFilterChoices.DISABLED_ONLY,
              expression: "Type = 'Disabled'"
            },
            {
              input: MoveInStreetFilterChoices.DROP_OFF_AUG_15_18,
              expression: "Type = 'LZAllWeek'"
            },
            {
              input: MoveInStreetFilterChoices.DROP_OFF_WEEKENDS,
              expression: "Type = 'LZSundayOnly'"
            },
            {
              input: MoveInStreetFilterChoices.NO_MOVE_IN_PARKING,
              expression: "Type = 'NoParking'"
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.LOTS_FILTER,
    label: 'Move-In Lots Filter',
    shortDescription: 'Lots Filter',
    description: 'Filter Move-In Lots to only show specific parking/restriction categories.',
    choices: [
      {
        value: MoveInLotFilterChoices.ALL,
        label: 'All Lot Categories'
      },
      {
        value: MoveInLotFilterChoices.WEEKEND_FREE,
        label: 'Aug 23-24 WEEKEND ONLY Free Parking'
      },
      {
        value: MoveInLotFilterChoices.WEEKEND_ONE_HOUR,
        label: '1-Hour Unloading, Weekends ONLY'
      },
      {
        value: MoveInLotFilterChoices.ONE_HOUR_LOT_PERMIT_AFTER_ONE_HOUR,
        label: '1-Hour Unloading. Lot Permit Required after 1 Hr'
      },
      {
        value: MoveInLotFilterChoices.FREE_AUG_19_23,
        label: 'Free Parking Aug 19-23; NO Overnight without Permit.'
      },
      {
        value: MoveInLotFilterChoices.ONE_HOUR_DROP_OFF_AUG_19_24,
        label: 'Aug 19-24 - 1 Hr drop-off; Lot permit required after 1 hour.'
      },
      {
        value: MoveInLotFilterChoices.DISABLED_ONLY,
        label: 'Disabled Parking, One Hour ONLY'
      },
      {
        value: MoveInLotFilterChoices.LOT_122,
        label: 'Lot 122 - Free Parking Aug 19-24; NO overnight without Lot 122 permit.'
      },
      {
        value: MoveInLotFilterChoices.FREE_AUG_19_24,
        label: 'Free Parking Aug 19-24'
      },
      {
        value: MoveInLotFilterChoices.PAID_VISITOR,
        label: 'Paid Visitor Parking'
      },
      {
        value: MoveInLotFilterChoices.NO_MOVE_IN_PARKING,
        label: 'No Move-In Parking. Lot Specific Permit Required'
      },
      {
        value: MoveInLotFilterChoices.FREE_AUG_22_23,
        label: 'Free Parking Aug 22-23; NO Overnight without Permit.'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
          conversions: [
            {
              input: MoveInLotFilterChoices.ALL,
              expression: '1=1'
            },
            {
              input: MoveInLotFilterChoices.WEEKEND_FREE,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'WeekendFree'"
            },
            {
              input: MoveInLotFilterChoices.WEEKEND_ONE_HOUR,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'WeekendOneHr'"
            },
            {
              input: MoveInLotFilterChoices.ONE_HOUR_LOT_PERMIT_AFTER_ONE_HOUR,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = '30a'"
            },
            {
              input: MoveInLotFilterChoices.FREE_AUG_19_23,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'SSG'"
            },
            {
              input: MoveInLotFilterChoices.ONE_HOUR_DROP_OFF_AUG_19_24,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = '40bcd'"
            },
            {
              input: MoveInLotFilterChoices.DISABLED_ONLY,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'Disabled'"
            },
            {
              input: MoveInLotFilterChoices.LOT_122,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = '122'"
            },
            {
              input: MoveInLotFilterChoices.FREE_AUG_19_24,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'Free'"
            },
            {
              input: MoveInLotFilterChoices.PAID_VISITOR,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'Paid'"
            },
            {
              input: MoveInLotFilterChoices.NO_MOVE_IN_PARKING,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'NoParking'"
            },
            {
              input: MoveInLotFilterChoices.FREE_AUG_22_23,
              expression: "\"GIS.TS.SPEV_Lot_Use.Fall_MoveIn\" = 'NSG'"
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.POI_FILTER,
    label: 'Points of Interest Filter',
    shortDescription: 'Points of Interest Filter',
    description: 'Filter Points of Interest to only show specific categories.',
    choices: [
      {
        value: MoveInPoiFilterChoices.ALL,
        label: 'All POI Categories'
      },
      {
        value: MoveInPoiFilterChoices.DINING,
        label: 'Dining Areas'
      },
      {
        value: MoveInPoiFilterChoices.RECYCLE,
        label: 'CardBoard Recycling Locations'
      },
      {
        value: MoveInPoiFilterChoices.NO_PARKING,
        label: 'No Parking'
      },
      {
        value: MoveInPoiFilterChoices.INFO,
        label: 'Info'
      },
      {
        value: MoveInPoiFilterChoices.ENGRAVING,
        label: 'Engraving Location'
      },
      {
        value: MoveInPoiFilterChoices.CHECK_IN,
        label: 'Check In Location'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
          conversions: [
            {
              input: MoveInPoiFilterChoices.ALL,
              expression: '1=1'
            },
            {
              input: MoveInPoiFilterChoices.DINING,
              expression: "Type = 'Dining'"
            },
            {
              input: MoveInPoiFilterChoices.RECYCLE,
              expression: "Type = 'Recycle'"
            },
            {
              input: MoveInPoiFilterChoices.NO_PARKING,
              expression: "Type = 'NoParking'"
            },
            {
              input: MoveInPoiFilterChoices.INFO,
              expression: "Type = 'Info'"
            },
            {
              input: MoveInPoiFilterChoices.ENGRAVING,
              expression: "Type = 'Bike'"
            },
            {
              input: MoveInPoiFilterChoices.CHECK_IN,
              expression: "Type = 'Keys'"
            }
          ]
        }
      ]
    }
  }
];

export const MoveInTs: AggiemapCustomMapConfiguration = {
  configuration: MoveInConfiguration,
  options: MoveInOptions,
  sources: MoveInColdLayerSources,
  references: MOVE_IN_LAYERS,
  type: 'general-map',
  discover: {
    id: MoveInConfiguration.id,
    name: MoveInConfiguration.name,
    description: 'Transportation and parking information for Fall Move In.',
    source: 'internal',
    type: 'parking',
    keywords: ['move in', 'fall move in', 'parking', 'transportation']
  }
};
