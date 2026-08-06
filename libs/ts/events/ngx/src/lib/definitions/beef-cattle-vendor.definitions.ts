import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum BEEF_CATTLE_LAYERS {
  ZONES = 'beef-cattle-zones',
  NO_PARKING_ZONES = 'beef-cattle-no-parking-zones',
  ROUTES = 'beef-cattle-routes',
  ALERT = 'beef-cattle-alert'
}

const beefCattleUrl = Connections.beefCattleUrl;

// Hash of the Alert picture-marker symbol (from the published renderer's `url`). Used to pull the
// icon straight from the service image endpoint so we can re-render it at its natural aspect ratio.
const ALERT_ICON_HASH = '3448d484ba8d748c96952fed64ae5bc2';

// Routes are directional, so each is rendered with an arrowhead at the end of the line to show the
// direction of travel. The published service distinguishes two route destinations on the `edited`
// field — keep both colors (green = routes to the Outside Exhibits, blue = routes to the
// Loading/Unloading Zones). The symbol field is an AutoCastSymbols intersection, so the whole native
// object is cast rather than the individual symbols.
const routesNative = {
  outFields: ['*'],
  renderer: {
    type: 'unique-value',
    field: 'edited',
    uniqueValueInfos: [
      {
        value: 'Outside Exhibits',
        label: 'To Outside Exhibits',
        symbol: {
          type: 'simple-line',
          color: [38, 115, 0, 255],
          width: 2,
          marker: { style: 'arrow', color: [38, 115, 0, 255], placement: 'end' }
        }
      },
      {
        value: 'Unloading Zones',
        label: 'To Loading/Unloading Zones',
        symbol: {
          type: 'simple-line',
          color: [0, 112, 255, 255],
          width: 2,
          marker: { style: 'arrow', color: [0, 112, 255, 255], placement: 'end' }
        }
      }
    ]
  }
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

// The published Alert symbol is a 32x40 (0.8 ratio) pin forced into a 25x25 square, which stretches
// it. Re-render the picture marker at a matching 0.8 ratio (24x30), pulling the image from the
// service's image endpoint by hash. Overriding the on-map renderer is required to de-stretch the
// symbol on the map, or a `legend` override alone only resizes the legend swatch.
const alertNative = {
  outFields: ['*'],
  renderer: {
    type: 'simple',
    symbol: {
      type: 'picture-marker',
      url: `${beefCattleUrl}/0/images/${ALERT_ICON_HASH}`,
      width: 24,
      height: 30,
      yoffset: 12
    }
  }
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

// The No Parking Zones layer uses a backward-diagonal red hatch fill, which the ArcGIS legend does
// not emit a swatch for. Supply an explicit matching red-hatch swatch so the legend entry has an icon.
const NO_PARKING_LEGEND_SWATCH =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSI1IiBzdHJva2U9IiNlNjAwMDAiIHN0cm9rZS13aWR0aD0iMS4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjIxIiBoZWlnaHQ9IjIxIiBmaWxsPSJ1cmwoI3ApIiBzdHJva2U9IiNlNjAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==';

export const BeefCattleColdLayerSources: LayerSource[] = [
  // NOTE: this array's order does not determine z-order — map draw order is driven by the order of
  // `BeefCattleLayerReferences` below (see the comment there).
  {
    type: 'feature',
    id: BEEF_CATTLE_LAYERS.ZONES,
    title: 'Zones',
    url: `${beefCattleUrl}/2`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'Type' },
      description: { field: 'description' }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BEEF_CATTLE_LAYERS.NO_PARKING_ZONES,
    title: 'No Parking Zones',
    url: `${beefCattleUrl}/3`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'No Parking',
      description: { field: 'description' }
    },
    legend: {
      mode: 'custom-src',
      src: NO_PARKING_LEGEND_SWATCH,
      width: 22,
      height: 22
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BEEF_CATTLE_LAYERS.ROUTES,
    title: 'Routes',
    url: `${beefCattleUrl}/1`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: { field: 'name' },
      description: { field: 'description' }
    },
    native: routesNative
  },
  {
    type: 'feature',
    id: BEEF_CATTLE_LAYERS.ALERT,
    title: 'Alert',
    url: `${beefCattleUrl}/0`,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Alert',
      description: { field: 'description' }
    },
    legend: {
      mode: 'renderer-symbol',
      preserveAspectRatio: true,
      fit: 'contain',
      width: 24,
      height: 30
    },
    native: alertNative
  }
];

export const BeefCattleConfiguration: EventConfiguration = {
  id: 'beef-cattle-vendor',
  name: 'Beef Cattle Vendor Load In',
  applicationName: 'Beef Cattle Vendor Load In Map',
  shortApplicationName: 'Beef Cattle Vendor Load In',
  introductionText:
    'Routes, loading/unloading zones, and parking restrictions for the Beef Cattle Vendor Load In.',
  eventDates: ['2026-08-02', '2026-08-05'],
  mapCenter: [-96.34092, 30.61332],
  zoom: 17,
  legendAllowVisibilityToggle: true
};

export const BeefCattleOptions: SpecialEventOptions = [];

// The order of this reference map drives the map draw order (NOT the order of the sources array
// above): EventService reverses this list and adds each layer with `map.add()`, so the FIRST entry
// here is added last and ends up on TOP. Alert sits above everything, Routes just below it, then the
// polygon layers beneath both.
const BeefCattleLayerReferences: Record<string, string> = {
  ALERT: BEEF_CATTLE_LAYERS.ALERT,
  ROUTES: BEEF_CATTLE_LAYERS.ROUTES,
  NO_PARKING_ZONES: BEEF_CATTLE_LAYERS.NO_PARKING_ZONES,
  ZONES: BEEF_CATTLE_LAYERS.ZONES
};

export const BeefCattleTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: BeefCattleConfiguration,
  options: BeefCattleOptions,
  sources: BeefCattleColdLayerSources,
  references: BeefCattleLayerReferences,
  discover: {
    id: BeefCattleConfiguration.id,
    name: BeefCattleConfiguration.name,
    description: 'Routes, loading/unloading zones, and parking restrictions for the Beef Cattle Vendor Load In.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['beef cattle', 'beef cattle vendor', 'vendor load in', 'vendor', 'loading', 'unloading', 'routes']
  }
};
