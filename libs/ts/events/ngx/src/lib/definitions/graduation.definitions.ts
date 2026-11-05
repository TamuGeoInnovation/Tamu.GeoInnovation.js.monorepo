import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

/**
 * The layers of both Graduation maps, Fall and Spring, which draw one service and differ only in their dates. Kept
 * here once: two copies of these were two places to repoint when the service changed (#2530).
 */

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];

// Drawn in this order, top first (docs/map-layers.md, "Drawing order"), as the map has drawn them: the road closures
// on top, and the lots at the bottom, whose fill would cover the rest (#2061).
export enum GRADUATION_LAYERS {
  GRADUATION_ROAD_CLOSURES = 'graduation-road-closed',
  GRADUATION_ACCESSIBLE_PARKING = 'graduation-accessible-parking',
  GRADUATION_TRAFFIC_FLOW = 'graduation-traffic-flow',
  GRADUATION_EVENT_PARKING_LOTS = 'graduation-event-parking-lots'
}

// Republished on 28 October 2026 with the closures split out of the lots (#2530): 0 Accessible Parking, 1 Traffic
// Flow, 2 Road Closures, 3 Event Parking, on both environments.
const eventUrl = Connections.graduationParkingUrl;

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
    id: GRADUATION_LAYERS.GRADUATION_ACCESSIBLE_PARKING,
    title: 'Accessible Parking',
    url: `${eventUrl}/0`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_TRAFFIC_FLOW,
    title: 'Traffic Flow',
    url: `${eventUrl}/1`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_EVENT_PARKING_LOTS,
    title: 'Event Parking',
    url: `${eventUrl}/3`,
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      // Production's Event Parking view also holds the two road closures that layer 2 draws (the same object ids);
      // development's does not. Without this, production would draw Olsen Blvd and Reed Arena Loop as parking too.
      // Remove it once production's view leaves the closures out, as development's does (#2530).
      definitionExpression: `Type <> 'Closure'`,
      labelingInfo: graduationParkingLabelingInfo
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: GRADUATION_LAYERS.GRADUATION_ROAD_CLOSURES,
    title: 'Road Closures',
    url: `${eventUrl}/2`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: 'Road Closed',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  }
];
