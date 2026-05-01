import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  ConversionDeconflictingStrategy,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MOVE_IN_LAYERS {
  MOVE_IN_POI = 'Move-In Points of Interest',
  MOVE_IN_STREETS = 'Move-In Streets',
  MOVE_IN_LOTS = 'Move-In Lots',
  RESIDENCE_HALL = 'Residence Hall'
}

const { moveInParkingUrl: moveInServiceUrl, basemapUrl: basemapServiceUrl } = Connections;

const lotUseField = '"GIS.TS.SPEV_Lot_Use.Fall_MoveIn"';

export const MoveInDefinitions = {
  RESIDENCE_HALL: {
    id: MOVE_IN_LAYERS.RESIDENCE_HALL,
    layerId: MOVE_IN_LAYERS.RESIDENCE_HALL,
    name: 'Residence Hall',
    url: `${basemapServiceUrl}/1`
  },
  MOVE_IN_POI: {
    id: MOVE_IN_LAYERS.MOVE_IN_POI,
    layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
    name: 'Move-In Points of Interest',
    url: `${moveInServiceUrl}/0`
  },
  MOVE_IN_STREETS: {
    id: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    name: 'Move-In Streets',
    url: `${moveInServiceUrl}/1`
  },
  MOVE_IN_LOTS: {
    id: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    name: 'Move-In Lots',
    url: `${moveInServiceUrl}/2`
  }
};

export const MoveInColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveInDefinitions.RESIDENCE_HALL.id,
    title: MoveInDefinitions.RESIDENCE_HALL.name,
    url: MoveInDefinitions.RESIDENCE_HALL.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: '1=0',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [24, 255, 255, 0.75],
          outline: {
            color: [24, 255, 255, 1],
            width: '3px'
          }
        }
      }
    }
  },
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
  applicationName: 'Move-In Parking Maps',
  shortApplicationName: 'Move-In Map',
  introductionText:
    'Plan ahead and make your move-in day a seamless and frustration-free experience! Answer a few short questions and get the best parking information.',
  reviewText:
    "Please review that your selections are correct. In doing so, you'll receive the best parking locations and avoid parking citations on your move-in day.",
  mapCenter: [-96.34358, 30.61035],
  eventDates: [],
  scheduleUrl: 'https://reslife.tamu.edu/movein/',
  zoom: 16,
  builderStartStep: 'accommodations'
};

enum MoveInBuilderOptions {
  MOVE_IN_DATE = 'move-in-date',
  RESIDENCE_HALL = 'move-in-residence-hall',
  ACCESSIBLE_PARKING = 'move-in-accessible-parking'
}

enum MoveInDateChoices {
  AUG_19_2026 = '2026-08-19',
  AUG_20_2026 = '2026-08-20',
  AUG_21_2026 = '2026-08-21',
  AUG_22_2026 = '2026-08-22',
  AUG_23_2026 = '2026-08-23',
  AUG_24_2026 = '2026-08-24'
}

enum MoveInHallChoices {
  CLEMENTS = 'hall-clements',
  DAVIS_GARY = 'hall-davis-gary',
  FOWLER = 'hall-fowler',
  HAAS = 'hall-haas',
  HOBBY = 'hall-hobby',
  HUGHES = 'hall-hughes',
  HULLABALOO = 'hall-hullabaloo',
  KEATHLEY = 'hall-keathley',
  LECHNER = 'hall-lechner',
  LEGGETT = 'hall-leggett',
  MCFADDEN = 'hall-mcfadden',
  MOSES = 'hall-moses',
  NEELEY = 'hall-neeley',
  SCHUHMACHER = 'hall-schuhmacher',
  WALTON = 'hall-walton',
  APPELT = 'hall-appelt',
  ASTON = 'hall-aston',
  DUNN = 'hall-dunn',
  EPPRIGHT = 'hall-eppright',
  HART = 'hall-hart',
  KRUEGER = 'hall-krueger',
  MOSHER = 'hall-mosher',
  RUDDER = 'hall-rudder',
  UNDERWOOD = 'hall-underwood',
  WELLS = 'hall-wells',
  WHITE_CREEK = 'hall-white-creek'
}

enum MoveInAccessibleChoices {
  YES = 'yes',
  NO = 'no'
}

const lotsForAug19To21 = `${lotUseField} IN ('30a', 'SSG', '40bcd', '122', 'Free', 'Paid', 'NoParking')`;
const lotsForAug22 = `${lotUseField} IN ('30a', 'SSG', '40bcd', '122', 'Free', 'Paid', 'NoParking', 'NSG')`;
const lotsForAug23 = `${lotUseField} IN ('WeekendFree', 'WeekendOneHr', '30a', 'SSG', '40bcd', '122', 'Free', 'Paid', 'NoParking', 'NSG')`;
const lotsForAug24 = `${lotUseField} IN ('WeekendFree', 'WeekendOneHr', '40bcd', '122', 'Free', 'Paid', 'NoParking')`;

export const MoveInOptions: SpecialEventOptions = [
  {
    value: MoveInBuilderOptions.MOVE_IN_DATE,
    label: 'Move-In Date',
    shortDescription: 'Move-In Date',
    description: 'Select your move-in day.',
    uiType: 'date-card-grid',
    choices: [
      {
        value: MoveInDateChoices.AUG_19_2026,
        label: 'August 19, 2026'
      },
      {
        value: MoveInDateChoices.AUG_20_2026,
        label: 'August 20, 2026'
      },
      {
        value: MoveInDateChoices.AUG_21_2026,
        label: 'August 21, 2026'
      },
      {
        value: MoveInDateChoices.AUG_22_2026,
        label: 'August 22, 2026'
      },
      {
        value: MoveInDateChoices.AUG_23_2026,
        label: 'August 23, 2026'
      },
      {
        value: MoveInDateChoices.AUG_24_2026,
        label: 'August 24, 2026'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
          conversions: [
            {
              input: MoveInDateChoices.AUG_19_2026,
              expression: lotsForAug19To21
            },
            {
              input: MoveInDateChoices.AUG_20_2026,
              expression: lotsForAug19To21
            },
            {
              input: MoveInDateChoices.AUG_21_2026,
              expression: lotsForAug19To21
            },
            {
              input: MoveInDateChoices.AUG_22_2026,
              expression: lotsForAug22
            },
            {
              input: MoveInDateChoices.AUG_23_2026,
              expression: lotsForAug23
            },
            {
              input: MoveInDateChoices.AUG_24_2026,
              expression: lotsForAug24
            }
          ]
        },
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
          conversions: [
            {
              input: MoveInDateChoices.AUG_19_2026,
              expression: "Type IN ('LZAllWeek', 'NoParking')"
            },
            {
              input: MoveInDateChoices.AUG_20_2026,
              expression: "Type IN ('LZAllWeek', 'NoParking')"
            },
            {
              input: MoveInDateChoices.AUG_21_2026,
              expression: "Type IN ('LZAllWeek', 'NoParking')"
            },
            {
              input: MoveInDateChoices.AUG_22_2026,
              expression: "Type IN ('LZSundayOnly', 'NoParking')"
            },
            {
              input: MoveInDateChoices.AUG_23_2026,
              expression: "Type IN ('LZSundayOnly', 'NoParking')"
            },
            {
              input: MoveInDateChoices.AUG_24_2026,
              expression: "Type IN ('LZSundayOnly', 'NoParking')"
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.RESIDENCE_HALL,
    label: 'Residence Hall',
    shortDescription: 'Residence Hall',
    description: 'Select your residence hall.',
    uiType: 'grouped-card-grid',
    choices: [
      {
        value: MoveInHallChoices.CLEMENTS,
        label: 'Clements Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.DAVIS_GARY,
        label: 'Davis-Gary Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.FOWLER,
        label: 'Fowler Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.HAAS,
        label: 'Haas Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.HOBBY,
        label: 'Hobby Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.HUGHES,
        label: 'Hughes Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.HULLABALOO,
        label: 'Hullabaloo Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.KEATHLEY,
        label: 'Keathley Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.LECHNER,
        label: 'Lechner Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.LEGGETT,
        label: 'Legett Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.MCFADDEN,
        label: 'McFadden Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.MOSES,
        label: 'Moses Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.NEELEY,
        label: 'Neeley Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.SCHUHMACHER,
        label: 'Schuhmacher Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.WALTON,
        label: 'Walton Hall',
        group: 'North Side'
      },
      {
        value: MoveInHallChoices.APPELT,
        label: 'Appelt Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.ASTON,
        label: 'Aston Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.DUNN,
        label: 'Dunn Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.EPPRIGHT,
        label: 'Eppright Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.HART,
        label: 'Hart Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.KRUEGER,
        label: 'Krueger Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.MOSHER,
        label: 'Mosher Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.RUDDER,
        label: 'Rudder Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.UNDERWOOD,
        label: 'Underwood Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.WELLS,
        label: 'Wells Hall',
        group: 'South Side'
      },
      {
        value: MoveInHallChoices.WHITE_CREEK,
        label: 'White Creek Apartments',
        group: 'White Creek'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.RESIDENCE_HALL,
          conversions: [
            {
              input: MoveInHallChoices.CLEMENTS,
              expression: "Bldg_Number IN ('0548')"
            },
            {
              input: MoveInHallChoices.DAVIS_GARY,
              expression: "Bldg_Number IN ('0415')"
            },
            {
              input: MoveInHallChoices.FOWLER,
              expression: "Bldg_Number IN ('0427')"
            },
            {
              input: MoveInHallChoices.HAAS,
              expression: "Bldg_Number IN ('0549')"
            },
            {
              input: MoveInHallChoices.HOBBY,
              expression: "Bldg_Number IN ('0653')"
            },
            {
              input: MoveInHallChoices.HUGHES,
              expression: "Bldg_Number IN ('0426')"
            },
            {
              input: MoveInHallChoices.HULLABALOO,
              expression: "Bldg_Number IN ('1416')"
            },
            {
              input: MoveInHallChoices.KEATHLEY,
              expression: "Bldg_Number IN ('0428')"
            },
            {
              input: MoveInHallChoices.LECHNER,
              expression: "Bldg_Number IN ('0294')"
            },
            {
              input: MoveInHallChoices.LEGGETT,
              expression: "Bldg_Number IN ('0419')"
            },
            {
              input: MoveInHallChoices.MCFADDEN,
              expression: "Bldg_Number IN ('0550')"
            },
            {
              input: MoveInHallChoices.MOSES,
              expression: "Bldg_Number IN ('0412')"
            },
            {
              input: MoveInHallChoices.NEELEY,
              expression: "Bldg_Number IN ('0652')"
            },
            {
              input: MoveInHallChoices.SCHUHMACHER,
              expression: "Bldg_Number IN ('0430')"
            },
            {
              input: MoveInHallChoices.WALTON,
              expression: "Bldg_Number IN ('0422')"
            },
            {
              input: MoveInHallChoices.APPELT,
              expression: "Bldg_Number IN ('0293')"
            },
            {
              input: MoveInHallChoices.ASTON,
              expression: "Bldg_Number IN ('0447')"
            },
            {
              input: MoveInHallChoices.DUNN,
              expression: "Bldg_Number IN ('0442')"
            },
            {
              input: MoveInHallChoices.EPPRIGHT,
              expression: "Bldg_Number IN ('0292')"
            },
            {
              input: MoveInHallChoices.HART,
              expression: "Bldg_Number IN ('0417')"
            },
            {
              input: MoveInHallChoices.KRUEGER,
              expression: "Bldg_Number IN ('0441')"
            },
            {
              input: MoveInHallChoices.MOSHER,
              expression: "Bldg_Number IN ('0433')"
            },
            {
              input: MoveInHallChoices.RUDDER,
              expression: "Bldg_Number IN ('0291')"
            },
            {
              input: MoveInHallChoices.UNDERWOOD,
              expression: "Bldg_Number IN ('0394')"
            },
            {
              input: MoveInHallChoices.WELLS,
              expression: "Bldg_Number IN ('0290')"
            },
            {
              input: MoveInHallChoices.WHITE_CREEK,
              expression: "Bldg_Number IN ('1590', '1591', '1592')"
            }
          ]
        }
      ]
    }
  },
  {
    value: MoveInBuilderOptions.ACCESSIBLE_PARKING,
    label: 'Require Accessible Parking',
    shortDescription: 'Require Accessible Parking',
    description: 'Will you or a relative require accessible parking accommodations?',
    uiType: 'binary',
    choices: [
      {
        value: MoveInAccessibleChoices.YES,
        label: 'Yes'
      },
      {
        value: MoveInAccessibleChoices.NO,
        label: 'No'
      }
    ],
    effects: {
      layers: [
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
          conversions: [
            {
              input: MoveInAccessibleChoices.YES,
              expression: `${lotUseField} = 'Disabled'`,
              deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_OR
            },
            {
              input: MoveInAccessibleChoices.NO,
              expression: '1=0',
              deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_OR
            }
          ]
        },
        {
          layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
          conversions: [
            {
              input: MoveInAccessibleChoices.YES,
              expression: "Type = 'Disabled'",
              deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_OR
            },
            {
              input: MoveInAccessibleChoices.NO,
              expression: '1=0',
              deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_OR
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
    mapType: 'campus',
    keywords: ['move in', 'fall move in', 'parking', 'transportation']
  }
};
