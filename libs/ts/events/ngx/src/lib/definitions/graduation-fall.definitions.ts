import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { commonSymbols } from './common.definitions';

import esri = __esri;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

export enum GRADUATION_LAYERS {
  GRADUATION_ACCESSIBLE_PARKING = 'graduation-accessible-parking',
  GRADUATION_TRAFFIC_FLOW = 'graduation-traffic-flow',
  GRADUATION_EVENT_PARKING_LOTS = 'graduation-event-parking-lots',
  GRADUATION_ROAD_CLOSURES = 'graduation-road-closed'
}
const eventUrl = Connections.graduationParkingUrl;

const GraduationEventDefinitions = {
  GRADUATION_ACCESSIBLE_PARKING: {
    id: GRADUATION_LAYERS.GRADUATION_ACCESSIBLE_PARKING,
    layerId: GRADUATION_LAYERS.GRADUATION_ACCESSIBLE_PARKING,
    name: 'Accessible Parking',
    url: `${eventUrl}/0`
  },
  GRADUATION_TRAFFIC_FLOW: {
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    layerId: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    name: 'Traffic Flow',
    url: `${eventUrl}/1`
  },
  GRADUATION_EVENT_PARKING_LOTS: {
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    name: 'Event Parking',
    url: `${eventUrl}/2`
  },
  GRADUATION_ROAD_CLOSURES: {
    id: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    layerId: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    name: 'Road Closures',
    url: `${eventUrl}/2`
  }
};

const graduationParkingRenderer = {
  type: 'unique-value',
  field: 'Type',
  uniqueValueInfos: [
    {
      value: 'Free Public Parking',
      label: 'Free Public Parking',
      symbol: {
        type: 'simple-fill',
        color: [95, 138, 232, 255],
        outline: {
          type: 'simple-line',
          color: [94, 52, 234, 255],
          width: 1
        }
      } as unknown as esri.SymbolProperties
    },
    {
      value: 'Reserved',
      label: 'Reserved',
      symbol: {
        type: 'simple-fill',
        color: [242, 160, 97, 255],
        outline: {
          type: 'simple-line',
          color: [230, 124, 0, 255],
          width: 1
        }
      } as unknown as esri.SymbolProperties
    },
    {
      value: 'Reserved - Accessible',
      label: 'Reserved',
      symbol: {
        type: 'simple-fill',
        color: [242, 160, 97, 255],
        outline: {
          type: 'simple-line',
          color: [230, 124, 0, 255],
          width: 1
        }
      } as unknown as esri.SymbolProperties
    }
  ]
} as unknown as esri.UniqueValueRendererProperties;

const graduationRoadClosureRenderer = {
  type: 'simple',
  label: 'Road Closed (Pedestrian Zone)',
  symbol: {
    type: 'simple-fill',
    style: 'backward-diagonal',
    color: [230, 0, 0, 255],
    outline: {
      type: 'simple-line',
      color: [230, 0, 0, 255],
      width: 1
    }
  }
} as unknown as esri.SimpleRendererProperties;

const graduationParkingLabelingInfo = [
  {
    labelExpressionInfo: {
      expression: '$feature.name'
    },
    maxScale: 0,
    minScale: 0,
    useCodedValues: true,
    symbol: {
      type: 'text',
      color: [0, 0, 0, 255],
      haloColor: [255, 255, 255, 255],
      haloSize: 1.5,
      font: {
        family: 'Open Sans Semibold',
        size: 10,
        weight: 'bold'
      }
    }
  }
] as unknown as esri.LabelClassProperties[];

export const GraduationColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_ACCESSIBLE_PARKING.id,
    title: GraduationEventDefinitions.GRADUATION_ACCESSIBLE_PARKING.name,
    url: GraduationEventDefinitions.GRADUATION_ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 13,
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.id,
    title: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.name,
    url: GraduationEventDefinitions.GRADUATION_TRAFFIC_FLOW.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 12,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        label: 'Traffic Flow',
        symbol: {
          ...commonSymbols.GREEN_ARROW,
          width: 3
        }
      } as unknown as esri.SimpleRendererProperties
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.id,
    title: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.name,
    url: GraduationEventDefinitions.GRADUATION_EVENT_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 10,
    native: {
      outFields: ['*'],
      definitionExpression: `Type <> 'Closure'`,
      renderer: graduationParkingRenderer,
      labelingInfo: graduationParkingLabelingInfo
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.id,
    title: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.name,
    url: GraduationEventDefinitions.GRADUATION_ROAD_CLOSURES.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Road Closed',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 11,
    native: {
      outFields: ['*'],
      definitionExpression: `Type = 'Closure'`,
      renderer: graduationRoadClosureRenderer
    } as unknown as FeatureNative
  }
];

const GRADUATION_DATES = [
  { eventDate: '2025-12-17', value: '2025-12-17T05:00:00.000Z', label: 'Wednesday, December 17th' },
  { eventDate: '2025-12-18', value: '2025-12-18T05:00:00.000Z', label: 'Thursday, December 18th' }
] as const;

export const GraduationConfiguration: EventConfiguration = {
  id: 'graduation-fall',
  name: 'Fall Commencement Ceremony',
  applicationName: 'Fall Commencement Transportation Map',
  shortApplicationName: 'Fall Commencement Map',
  introductionText: 'Get the best transportation and parking information for the fall commencement ceremonies.',
  eventDates: GRADUATION_DATES.map(({ eventDate }) => eventDate),
  scheduleUrl: 'https://aggie.tamu.edu/graduation',
  mapCenter: [-96.34458, 30.60629],
  zoom: 16
};

export const GraduationOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'Please select the day of your commencement or commissioning ceremony to provide the most accurate transportation and parking information.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    choices: GRADUATION_DATES.map(({ value, label }) => ({ value, label })),
    effects: {
      layers: [
        {
          layerId: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
          conversions: GRADUATION_DATES.map(({ value }) => ({
            input: value,
            propOverrides: {
              visible: true
            }
          }))
        }
      ]
    }
  }
];

export const GraduationFallEventTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: GraduationConfiguration,
  options: GraduationOptions,
  sources: GraduationColdLayerSources,
  references: GRADUATION_LAYERS,
  discover: {
    id: GraduationConfiguration.id,
    name: GraduationConfiguration.name,
    description: 'Transportation and parking information for fall graduation ceremonies.',
    source: 'internal',
    type: 'event',
    columnKey: 'fall',
    keywords: ['graduation', 'commencement', 'parking', 'transportation']
  }
};
