import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import esri = __esri;

export enum NSC_PARKING_LAYERS {
  // Draw layer (MapImage)
  NSC_PARKING_DRAW = 'nsc-parking-lots-draw',

  // Legend/Popup layer (Feature)
  NSC_PARKING_LOTS = 'NSC Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer';

export const NscParkingDefinitions = {
  NSC_PARKING_LOTS: {
    id: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    layerId: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    name: 'NSC Parking Lots',
    url: `${eventUrl}/11`
  }
};

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

/**
 * Matches /11 drawingInfo.renderer:
 * unique value on GIS.TS.Lot_Use.NSCm where value "1" = NSC Permit Authorized
 */
const nscLegendRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.Lot_Use.NSCm',
  defaultLabel: 'Lot Specific Permit Required',
  defaultSymbol: {
    type: 'simple-fill',
    color: [204, 204, 204, 255],
    outline: null
  } as unknown as esri.SymbolProperties,
  uniqueValueInfos: [
    {
      value: '1',
      label: 'NSC Permit Authorized',
      symbol: {
        type: 'simple-fill',
        color: [90, 0, 0, 255],
        outline: null
      } as unknown as esri.SymbolProperties
    }
  ]
};

export const NscParkingColdLayerSources: LayerSource[] = [
  // 1) DRAW LAYER (MapImage) — renders polygons reliably
  {
    type: 'map-image',
    id: NSC_PARKING_LAYERS.NSC_PARKING_DRAW,
    title: 'NSC Parking Lots (Draw)',
    url: eventUrl,
    visible: true,
    layerIndex: 998,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 11,
          title: 'NSC Parking Lots',
          visible: true,
          // let the feature layer own popups
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  },

  // 2) LEGEND + POPUP LAYER (Feature) — drives legend + popups, hidden rendering
  {
    type: 'feature',
    id: NscParkingDefinitions.NSC_PARKING_LOTS.id,
    title: NscParkingDefinitions.NSC_PARKING_LOTS.name,
    url: NscParkingDefinitions.NSC_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',

    popupComponent: MarkdownPopupComponent,
    popupData: {
      // Use the Baseball-style field mapping (dot names are "collapsed" flat keys)
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.NewStudentConfN',
        collapsed: true
      }
    },

    native: {
      outFields: ['*'],
      // ensure it uses the same categories the service would show
      renderer: nscLegendRenderer
    } as unknown as FeatureNative
  }
];

export const NscParkingConfiguration: EventConfiguration = {
  id: 'nsc-parking',
  name: 'New Student Conference Parking',
  applicationName: 'New Student Conference Parking Map',
  shortApplicationName: 'NSC Parking Map',
  introductionText: 'Parking map for New Student Conference (NSC) permits.',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const NscParkingOptions: SpecialEventOptions = [];

export const NscParkingTs: ISpecialEventRoot = {
  configuration: NscParkingConfiguration,
  options: NscParkingOptions,
  sources: NscParkingColdLayerSources,
  references: NSC_PARKING_LAYERS,
  discover: {
    id: NscParkingConfiguration.id,
    name: NscParkingConfiguration.name,
    description: 'Parking lot information for New Student Conference (NSC) permits.',
    source: 'internal',
    type: 'event',
    keywords: ['nsc', 'new student conference', 'parking', 'permit']
  }
};
