import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum SEC_GROUNDS_LAYERS {
  DAY1_POIS = 'sec-grounds-day1-pois',
  DAY1_ROUTES = 'sec-grounds-day1-routes',
  DAY2_POIS = 'sec-grounds-day2-pois',
  DAY2_ROUTES = 'sec-grounds-day2-routes',
  DAY3_POIS = 'sec-grounds-day3-pois',
  DAY3_ROUTES = 'sec-grounds-day3-routes'
}

enum ConferenceDay {
  DAY1 = 'day1',
  DAY2 = 'day2',
  DAY3 = 'day3'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/SEC_Grounds_Conference/MapServer';

export const SecGroundsColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY1_ROUTES,
    title: 'Day 1 Routes',
    url: `${eventUrl}/2`,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY1_POIS,
    title: 'Day 1 Points of Interest',
    url: `${eventUrl}/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY2_ROUTES,
    title: 'Day 2 Routes',
    url: `${eventUrl}/5`,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY2_POIS,
    title: 'Day 2 Points of Interest',
    url: `${eventUrl}/4`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY3_ROUTES,
    title: 'Day 3 Routes',
    url: `${eventUrl}/8`,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SEC_GROUNDS_LAYERS.DAY3_POIS,
    title: 'Day 3 Points of Interest',
    url: `${eventUrl}/7`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const SecGroundsConfiguration: EventConfiguration = {
  id: 'sec-grounds-conference',
  name: 'SEC Grounds Conference',
  applicationName: 'SEC Grounds Conference Map',
  shortApplicationName: 'SEC Grounds Map',
  introductionText: 'Get routes and points of interest for the SEC Grounds Conference.',
  eventDates: ['2026-04-07', '2026-04-08', '2026-04-09'],
  mapCenter: [-96.3438, 30.6186],
  zoom: 14,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  }
};

export const SecGroundsSpecialEventOptions: SpecialEventOptions = [
  {
    value: 'conference-day',
    label: 'Conference Day',
    description: 'Select which day of the SEC Grounds Conference you are attending to see the relevant routes and points of interest.',
    shortDescription: 'Conference Day',
    choices: [
      {
        value: ConferenceDay.DAY1,
        label: 'Day 1 (April 7, 2026)'
      },
      {
        value: ConferenceDay.DAY2,
        label: 'Day 2 (April 8, 2026)'
      },
      {
        value: ConferenceDay.DAY3,
        label: 'Day 3 (April 9, 2026)'
      }
    ],
    effects: {
      layers: [
        {
          layerId: SEC_GROUNDS_LAYERS.DAY1_POIS,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=1' },
            { input: ConferenceDay.DAY2, expression: '1=0' },
            { input: ConferenceDay.DAY3, expression: '1=0' }
          ]
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY1_ROUTES,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=1' },
            { input: ConferenceDay.DAY2, expression: '1=0' },
            { input: ConferenceDay.DAY3, expression: '1=0' }
          ]
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY2_POIS,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=0' },
            { input: ConferenceDay.DAY2, expression: '1=1' },
            { input: ConferenceDay.DAY3, expression: '1=0' }
          ]
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY2_ROUTES,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=0' },
            { input: ConferenceDay.DAY2, expression: '1=1' },
            { input: ConferenceDay.DAY3, expression: '1=0' }
          ]
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY3_POIS,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=0' },
            { input: ConferenceDay.DAY2, expression: '1=0' },
            { input: ConferenceDay.DAY3, expression: '1=1' }
          ]
        },
        {
          layerId: SEC_GROUNDS_LAYERS.DAY3_ROUTES,
          conversions: [
            { input: ConferenceDay.DAY1, expression: '1=0' },
            { input: ConferenceDay.DAY2, expression: '1=0' },
            { input: ConferenceDay.DAY3, expression: '1=1' }
          ]
        }
      ]
    }
  }
];

export const SecGroundsConferenceTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: SecGroundsConfiguration,
  options: SecGroundsSpecialEventOptions,
  sources: SecGroundsColdLayerSources,
  references: SEC_GROUNDS_LAYERS,
  discover: {
    id: SecGroundsConfiguration.id,
    name: SecGroundsConfiguration.name,
    description: 'Routes and points of interest for the SEC Grounds Conference.',
    source: 'internal',
    type: 'event',
    keywords: ['sec', 'grounds', 'conference', 'routes', 'transportation']
  }
};
