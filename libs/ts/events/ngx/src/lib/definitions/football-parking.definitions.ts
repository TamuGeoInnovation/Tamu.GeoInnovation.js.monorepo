import { LayerSource } from '@tamu-gisc/common/types';
import { getDefaultGisHost } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

/**
 * Football gameday transportation map.
 *
 * Every mode reads from its own public hosted service, each pre-filtered and re-symbolized by
 * Transportation Services to exactly what that mode's map should show. The shared, client-filtered
 * `TSFootball_Cache`/`TSFootball_view` services and the Marcomm `Lots_view` service are no longer
 * used, and neither is the old "Personal Vehicle" mode they backed.
 *
 * Three consequences of the per-mode services shape the code below:
 *
 * 1. **No client-side filtering.** Each view bakes in its own definition expression (the route
 *    layers, for example, publish as `Type = 'Vehicle' And Pre_Post = 'Pre-Game'`), so the layer
 *    sources carry no `expression` conversions — selecting a mode only toggles visibility.
 * 2. **The service renderer is the mode.** The lot polygons are the same 118 features in every
 *    vehicle-mode view; what differs is the authored renderer, which highlights that mode's lots and
 *    collapses the rest into a grey "Other Lots" category. The gameday parking points likewise carry
 *    per-mode categories with embedded icon `imageData`. Those renderers are used as-authored —
 *    overriding them would erase the distinction between modes.
 * 3. **Two exceptions still need overriding.** The route layers publish as flat 15px solid green
 *    lines (the "green blob"), and the Street/Grass Areas layers publish solid fills where the
 *    portal items carry hatch fills. Both are re-symbolized below.
 *
 * Field names on these views are lowercase and case-sensitive in SQL where-clauses.
 */
const gisHost = getDefaultGisHost();
const HOSTED_ROOT = `https://${gisHost}/arcgis/rest/services/Hosted`;

/**
 * Sublayer indices shared by the four "vehicle" mode services (Pay/AVP, ParkMobile, 12th Man,
 * Presale). Each publishes the same sublayers at the same indices — the entry services carry Entry
 * Routes (1) and the exit services Exit Routes (2), while Gameday Parking, Street/Grass Areas and
 * Football Parking Lots are identical copies in both. The shared three are therefore sourced once
 * from the entry service and shown for both directions rather than duplicated per direction.
 */
const VEHICLE_LAYER_INDEX = {
  GAMEDAY_PARKING: 0,
  ENTRY_ROUTES: 1,
  EXIT_ROUTES: 2,
  STREET_GRASS: 3,
  LOTS: 4
} as const;

/**
 * Declaration order here IS the top-to-bottom map draw order. `EventService` reads this enum,
 * reverses it, then adds each layer with `map.add()` (no index), so ArcGIS appends bottom→top — the
 * FIRST entry ends up drawn on top, the LAST at the bottom. Only one mode's layers are ever visible
 * at a time, so the ordering that matters is within each mode: points first, then lines, then the
 * polygons that must stay underneath them.
 */
export enum FOOTBALL_PARKING_LAYERS {
  // --- Pay Upon Arrival / Any Valid Texas A&M Permit ---
  FP_PAY_AVP_GAMEDAY_PARKING = 'football-pay-avp-gameday-parking',
  FP_PAY_AVP_ENTRY_ROUTES = 'football-pay-avp-entry-routes',
  FP_PAY_AVP_EXIT_ROUTES = 'football-pay-avp-exit-routes',
  FP_PAY_AVP_STREET_GRASS_AREAS = 'football-pay-avp-street-grass-areas',
  FP_PAY_AVP_PARKING_LOTS = 'football-pay-avp-parking-lots',

  // --- ParkMobile Prepay ---
  FP_PARKMOBILE_GAMEDAY_PARKING = 'football-parkmobile-gameday-parking',
  FP_PARKMOBILE_ENTRY_ROUTES = 'football-parkmobile-entry-routes',
  FP_PARKMOBILE_EXIT_ROUTES = 'football-parkmobile-exit-routes',
  FP_PARKMOBILE_STREET_GRASS_AREAS = 'football-parkmobile-street-grass-areas',
  FP_PARKMOBILE_PARKING_LOTS = 'football-parkmobile-parking-lots',

  // --- 12th Man ---
  FP_12TH_MAN_GAMEDAY_PARKING = 'football-12th-man-gameday-parking',
  FP_12TH_MAN_ENTRY_ROUTES = 'football-12th-man-entry-routes',
  FP_12TH_MAN_EXIT_ROUTES = 'football-12th-man-exit-routes',
  FP_12TH_MAN_STREET_GRASS_AREAS = 'football-12th-man-street-grass-areas',
  FP_12TH_MAN_PARKING_LOTS = 'football-12th-man-parking-lots',

  // --- Presale Season Parking ---
  FP_PRESALE_GAMEDAY_PARKING = 'football-presale-gameday-parking',
  FP_PRESALE_ENTRY_ROUTES = 'football-presale-entry-routes',
  FP_PRESALE_EXIT_ROUTES = 'football-presale-exit-routes',
  FP_PRESALE_STREET_GRASS_AREAS = 'football-presale-street-grass-areas',
  FP_PRESALE_PARKING_LOTS = 'football-presale-parking-lots',

  // --- Rideshare ---
  FP_RIDESHARE_LOCATIONS = 'football-rideshare-locations',

  // --- Shuttle ---
  FP_SHUTTLE_STOPS = 'football-shuttle-stops',
  FP_SHUTTLE_ROUTES = 'football-shuttle-routes',

  // --- RV ---
  FP_RV_GAMEDAY_PARKING = 'football-rv-gameday-parking',
  FP_RV_RNS_SPACES = 'football-rv-rns-spaces',
  FP_RV_STRIPES = 'football-rv-stripes',
  FP_RV_STREET_GRASS_AREAS = 'football-rv-street-grass-areas',
  FP_RV_PARKING_LOTS = 'football-rv-parking-lots',

  // --- Micromobility ---
  FP_MICROMOBILITY_PARKING = 'football-micromobility-parking',
  FP_MICROMOBILITY_EXIT_ROUTES = 'football-micromobility-exit-routes',
  FP_BIKE_LANES = 'football-bike-lanes',
  FP_BIKE_DISMOUNT_ZONES = 'football-bike-dismount-zones',
  FP_BIKE_VEO_GEOFENCE = 'football-bike-veo-geofence',

  // --- Pedestrian ---
  FP_PEDESTRIAN_EXIT_ROUTES = 'football-pedestrian-exit-routes'
}

/**
 * The user-selectable transportation modes (the first builder step), in the order they are shown.
 */
enum TransportType {
  PAY_AVP = 'pay-avp',
  PARKMOBILE = 'parkmobile',
  TWELFTH_MAN = '12th-man',
  PRESALE = 'presale',
  RIDESHARE = 'rideshare',
  SHUTTLE = 'shuttle',
  RV = 'rv',
  MICROMOBILITY = 'micromobility',
  PEDESTRIAN = 'pedestrian'
}

/**
 * The Entry/Exit sub-choice (the second, conditional builder step). Only shown for the modes that
 * publish a separate arrival and departure service.
 */
enum Direction {
  ENTRY = 'entry',
  EXIT = 'exit'
}

enum FootballBuilderOptions {
  TRANSPORT_TYPE = 'transport-type',
  DIRECTION = 'direction'
}

/**
 * Shared prop overrides. `native.visible`/`native.listMode` are authoritative because the layer factory
 * spreads `native` last (see EventService), so effects always drive visibility through `native`.
 */
const SHOW: Partial<LayerSource> = { native: { visible: true, listMode: 'show' } };
const HIDE: Partial<LayerSource> = { native: { visible: false, listMode: 'hide' } };

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureNativeProps = NonNullable<FeatureNative>;
type FeatureRenderer = NonNullable<FeatureNativeProps['renderer']>;
type FeatureLabelingInfo = NonNullable<FeatureNativeProps['labelingInfo']>;

/**
 * Base `native` props every layer starts from: loaded but hidden until a mode turns it on. The cast
 * keeps the renderer/labelingInfo overrides assignable — spreading a shared object loses the
 * contextual typing an inline literal would get from `LayerSource`'s discriminated union.
 */
const hiddenNative = (overrides: Partial<FeatureNativeProps> = {}): FeatureNativeProps =>
  ({
    outFields: ['*'],
    visible: false,
    listMode: 'hide',
    ...overrides
  } as unknown as FeatureNativeProps);

/**
 * Route arrow colors, keyed by travel type. Every route layer publishes as a flat solid green line
 * regardless of mode, so the cyclist and pedestrian maps are re-colored here to match the scheme
 * used across the other event maps.
 */
const ROUTE_COLORS = {
  vehicle: 'rgb(38, 115, 0)',
  cyclist: 'rgb(112, 48, 160)',
  pedestrian: 'rgb(0, 92, 230)'
};

/** A solid line with a direction arrow at its end, used to re-symbolize the flat route layers. */
const arrowLineSymbol = (color: string, width = 3): esri.SimpleLineSymbolProperties => ({
  type: 'simple-line',
  color,
  width,
  style: 'solid',
  marker: { style: 'arrow', color, placement: 'end' }
});

/** Renderer for a route layer whose features are all a single travel type. */
const routeRenderer = (color: string) =>
  ({
    type: 'simple',
    symbol: arrowLineSymbol(color)
  } as unknown as FeatureRenderer);

const createCimHatchPolygonSymbol = (
  outlineColor: number[],
  outlineWidth: number,
  hatches: Array<{
    color: number[];
    width: number;
    rotation: number;
    separation: number;
    offsetX?: number;
    offsetY?: number;
    colorLocked?: boolean;
  }>
) => ({
  type: 'cim',
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPolygonSymbol',
      angleAlignment: 'Map',
      symbolLayers: [
        {
          type: 'CIMSolidStroke',
          enable: true,
          color: outlineColor,
          width: outlineWidth
        },
        ...hatches.map((hatch) => ({
          type: 'CIMHatchFill',
          enable: true,
          colorLocked: hatch.colorLocked,
          rotation: hatch.rotation,
          separation: hatch.separation,
          offsetX: hatch.offsetX,
          offsetY: hatch.offsetY,
          lineSymbol: {
            type: 'CIMLineSymbol',
            symbolLayers: [
              {
                type: 'CIMSolidStroke',
                enable: true,
                color: hatch.color,
                width: hatch.width
              }
            ]
          }
        }))
      ]
    }
  }
});

const streetClosureHatchSymbol = createCimHatchPolygonSymbol([230, 0, 0, 255], 0.4, [
  {
    color: [230, 0, 0, 255],
    width: 1.2,
    rotation: -30,
    separation: 5,
    offsetX: -0.45,
    offsetY: -0.7794228634059949
  },
  {
    color: [230, 152, 0, 255],
    width: 1.2,
    rotation: 30,
    separation: 5,
    colorLocked: true
  }
]);

const reservedTailgateHatchSymbol = createCimHatchPolygonSymbol([122, 142, 245, 255], 2, [
  { color: [122, 142, 245, 255], width: 0.5, rotation: 135, separation: 5 },
  { color: [122, 142, 245, 255], width: 0.5, rotation: 45, separation: 5 }
]);

const permitRequiredHatchSymbol = createCimHatchPolygonSymbol([230, 152, 0, 255], 1, [
  { color: [255, 170, 0, 255], width: 1, rotation: 135, separation: 6 },
  { color: [255, 170, 0, 255], width: 1, rotation: 45, separation: 6 }
]);

/**
 * Street/Grass Areas renderer. The FeatureServer metadata publishes these three categories as solid
 * fills, while the portal items carry the authored hatch renderer shown in Map Viewer. Reproduce
 * those item-level overrides here. Every mode's copy of the layer carries the same three categories,
 * so one renderer serves them all.
 */
const streetGrassRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    { value: 'AreaClosed', label: 'Street Closures', symbol: streetClosureHatchSymbol },
    { value: 'Permit Required', label: 'Permit Required', symbol: permitRequiredHatchSymbol },
    { value: 'Tailgate', label: 'Reserved Tailgate', symbol: reservedTailgateHatchSymbol }
  ]
} as unknown as FeatureRenderer;

/** White-on-black-halo label text shared by every parking-lot labeling rule. */
const lotLabelSymbol: esri.TextSymbolProperties & { type: 'text' } = {
  type: 'text',
  color: [255, 255, 255, 255],
  haloColor: [0, 0, 0, 255],
  haloSize: 1,
  font: {
    family: 'Arial',
    size: 10,
    style: 'normal',
    weight: 'bold'
  }
};

/**
 * Lot labels. The views publish no labeling of their own, so the rules are supplied here: 12th Man
 * lots show their parking pass letter on a second line, priced lots append the price, and everything
 * else shows just the lot name. `price` is a dedicated field on these views (e.g. `$25`).
 */
const lotLabelingInfo = [
  {
    labelExpressionInfo: {
      expression: '$feature.name + TextFormatting.NewLine + $feature.twelfthman'
    },
    labelPlacement: 'always-horizontal',
    useCodedValues: true,
    symbol: lotLabelSymbol,
    minScale: 9500,
    maxScale: 0,
    where: "twelfthman IS NOT NULL AND TRIM(twelfthman) <> ''"
  },
  {
    labelExpressionInfo: {
      expression: "$feature.name + ' - ' + $feature.price"
    },
    labelPlacement: 'always-horizontal',
    useCodedValues: true,
    symbol: lotLabelSymbol,
    minScale: 9500,
    maxScale: 0,
    where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND price IS NOT NULL AND TRIM(price) <> ''"
  },
  {
    labelExpression: '[name]',
    labelPlacement: 'always-horizontal',
    useCodedValues: true,
    symbol: lotLabelSymbol,
    minScale: 9500,
    maxScale: 0,
    where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND (price IS NULL OR TRIM(price) = '')"
  }
] as unknown as FeatureLabelingInfo;

/**
 * The gameday/micromobility/rideshare picture markers are pin-shaped (natural ~60x73, 0.82 ratio) but
 * the service renderer forces them into a 25x25 square, which stretches them wide on the map AND in
 * the legend swatch. Re-render both at a matching ~0.82 ratio. `EsriMapService` applies these
 * width/height hints to the on-map picture markers too (`applyLegendOverrideToLayerSymbols`), so a
 * single override de-stretches the icons and the legend swatches without re-embedding the images.
 */
const PIN_LEGEND: LayerSource['legend'] = {
  mode: 'renderer-symbol',
  preserveAspectRatio: true,
  fit: 'contain',
  width: 25,
  height: 30
};

/**
 * A "vehicle" mode: one of the four modes published as a matched pair of entry/exit services sharing
 * the same five-sublayer shape.
 */
interface VehicleMode {
  transport: TransportType;
  entryUrl: string;
  exitUrl: string;
  layers: {
    gamedayParking: FOOTBALL_PARKING_LAYERS;
    entryRoutes: FOOTBALL_PARKING_LAYERS;
    exitRoutes: FOOTBALL_PARKING_LAYERS;
    streetGrass: FOOTBALL_PARKING_LAYERS;
    lots: FOOTBALL_PARKING_LAYERS;
  };
}

const VEHICLE_MODES: VehicleMode[] = [
  {
    transport: TransportType.PAY_AVP,
    entryUrl: `${HOSTED_ROOT}/Pay_AVP_entry/FeatureServer`,
    exitUrl: `${HOSTED_ROOT}/Pay_AVP_2_exit/FeatureServer`,
    layers: {
      gamedayParking: FOOTBALL_PARKING_LAYERS.FP_PAY_AVP_GAMEDAY_PARKING,
      entryRoutes: FOOTBALL_PARKING_LAYERS.FP_PAY_AVP_ENTRY_ROUTES,
      exitRoutes: FOOTBALL_PARKING_LAYERS.FP_PAY_AVP_EXIT_ROUTES,
      streetGrass: FOOTBALL_PARKING_LAYERS.FP_PAY_AVP_STREET_GRASS_AREAS,
      lots: FOOTBALL_PARKING_LAYERS.FP_PAY_AVP_PARKING_LOTS
    }
  },
  {
    transport: TransportType.PARKMOBILE,
    entryUrl: `${HOSTED_ROOT}/PM_entry/FeatureServer`,
    exitUrl: `${HOSTED_ROOT}/PM_exit/FeatureServer`,
    layers: {
      gamedayParking: FOOTBALL_PARKING_LAYERS.FP_PARKMOBILE_GAMEDAY_PARKING,
      entryRoutes: FOOTBALL_PARKING_LAYERS.FP_PARKMOBILE_ENTRY_ROUTES,
      exitRoutes: FOOTBALL_PARKING_LAYERS.FP_PARKMOBILE_EXIT_ROUTES,
      streetGrass: FOOTBALL_PARKING_LAYERS.FP_PARKMOBILE_STREET_GRASS_AREAS,
      lots: FOOTBALL_PARKING_LAYERS.FP_PARKMOBILE_PARKING_LOTS
    }
  },
  {
    transport: TransportType.TWELFTH_MAN,
    entryUrl: `${HOSTED_ROOT}/12thMan_entry/FeatureServer`,
    exitUrl: `${HOSTED_ROOT}/12thMan_exit/FeatureServer`,
    layers: {
      gamedayParking: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_GAMEDAY_PARKING,
      entryRoutes: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_ENTRY_ROUTES,
      exitRoutes: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_EXIT_ROUTES,
      streetGrass: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_STREET_GRASS_AREAS,
      lots: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_PARKING_LOTS
    }
  },
  {
    transport: TransportType.PRESALE,
    entryUrl: `${HOSTED_ROOT}/Presale_entry/FeatureServer`,
    exitUrl: `${HOSTED_ROOT}/Presale_2_exit/FeatureServer`,
    layers: {
      gamedayParking: FOOTBALL_PARKING_LAYERS.FP_PRESALE_GAMEDAY_PARKING,
      entryRoutes: FOOTBALL_PARKING_LAYERS.FP_PRESALE_ENTRY_ROUTES,
      exitRoutes: FOOTBALL_PARKING_LAYERS.FP_PRESALE_EXIT_ROUTES,
      streetGrass: FOOTBALL_PARKING_LAYERS.FP_PRESALE_STREET_GRASS_AREAS,
      lots: FOOTBALL_PARKING_LAYERS.FP_PRESALE_PARKING_LOTS
    }
  }
];

/**
 * Builds the five layer sources for a vehicle mode. The three non-route layers come from the entry
 * service because both services publish identical copies of them.
 */
const vehicleModeSources = (mode: VehicleMode): LayerSource[] => [
  {
    type: 'feature',
    id: mode.layers.gamedayParking,
    title: 'Gameday Parking',
    url: `${mode.entryUrl}/${VEHICLE_LAYER_INDEX.GAMEDAY_PARKING}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.notes',
      description: 'attributes.notes_1'
    },
    legend: PIN_LEGEND,
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: mode.layers.entryRoutes,
    title: 'Entry Routes',
    url: `${mode.entryUrl}/${VEHICLE_LAYER_INDEX.ENTRY_ROUTES}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: hiddenNative({ renderer: routeRenderer(ROUTE_COLORS.vehicle) })
  },
  {
    type: 'feature',
    id: mode.layers.exitRoutes,
    title: 'Exit Routes',
    url: `${mode.exitUrl}/${VEHICLE_LAYER_INDEX.EXIT_ROUTES}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: hiddenNative({ renderer: routeRenderer(ROUTE_COLORS.vehicle) })
  },
  {
    type: 'feature',
    id: mode.layers.streetGrass,
    title: 'Street/Grass Areas (Click for details)',
    url: `${mode.entryUrl}/${VEHICLE_LAYER_INDEX.STREET_GRASS}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.anote'
    },
    native: hiddenNative({ renderer: streetGrassRenderer })
  },
  {
    type: 'feature',
    id: mode.layers.lots,
    title: 'Football Parking Lots',
    url: `${mode.entryUrl}/${VEHICLE_LAYER_INDEX.LOTS}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: hiddenNative({ labelingInfo: lotLabelingInfo })
  }
];

export const FootballParkingColdLayerSources: LayerSource[] = [
  ...VEHICLE_MODES.flatMap(vehicleModeSources),

  // --- Rideshare ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RIDESHARE_LOCATIONS,
    title: 'Rideshare Locations',
    url: `${HOSTED_ROOT}/RS_view/FeatureServer/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.notes',
      description: 'attributes.notes_1'
    },
    legend: PIN_LEGEND,
    native: hiddenNative()
  },

  // --- Shuttle ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_STOPS,
    title: 'Campus Shuttle Stops',
    url: `${HOSTED_ROOT}/Football_Shuttle_View/FeatureServer/5`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.stopname}',
      description: 'For route: {attributes.routename}'
    },
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_ROUTES,
    title: 'Shuttle Routes',
    url: `${HOSTED_ROOT}/Football_Shuttle_View/FeatureServer/6`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.routename} ({attributes.routenum})'
    },
    native: hiddenNative()
  },

  // --- RV ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_GAMEDAY_PARKING,
    title: 'Gameday Parking',
    url: `${HOSTED_ROOT}/RV_view/FeatureServer/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.notes',
      description: 'attributes.notes_1'
    },
    legend: PIN_LEGEND,
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_RNS_SPACES,
    title: 'RNS Spaces',
    url: `${HOSTED_ROOT}/RV_view/FeatureServer/2`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.rv_spcnum',
      description: 'attributes.spc_type'
    },
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_STRIPES,
    title: 'Stripes',
    url: `${HOSTED_ROOT}/RV_view/FeatureServer/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.use_',
      description: 'attributes.location'
    },
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_STREET_GRASS_AREAS,
    title: 'Street/Grass Areas (Click for details)',
    url: `${HOSTED_ROOT}/RV_view/FeatureServer/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.anote'
    },
    native: hiddenNative({ renderer: streetGrassRenderer })
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_PARKING_LOTS,
    title: 'Football Parking Lots',
    url: `${HOSTED_ROOT}/RV_view/FeatureServer/4`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: hiddenNative({ labelingInfo: lotLabelingInfo })
  },

  // --- Micromobility ---
  // The parking, dismount and geofence layers are identical copies in the entry and exit services, so
  // they are sourced from the entry service and shown for both directions. Bike Lanes exist only on
  // the entry service and Exit Routes only on the exit service.
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_PARKING,
    title: 'Micromobility Parking Area',
    url: `${HOSTED_ROOT}/FBike_entry/FeatureServer/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.type',
      description: 'attributes.br_notes'
    },
    legend: PIN_LEGEND,
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${HOSTED_ROOT}/FBike_exit/FeatureServer/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: hiddenNative({ renderer: routeRenderer(ROUTE_COLORS.cyclist) })
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_LANES,
    title: 'Bike Lanes',
    url: `${HOSTED_ROOT}/FBike_entry/FeatureServer/4`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.use_',
      description: 'attributes.location'
    },
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_DISMOUNT_ZONES,
    title: 'Bike Dismount Zones',
    url: `${HOSTED_ROOT}/FBike_entry/FeatureServer/2`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.bike_notes'
    },
    native: hiddenNative()
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_VEO_GEOFENCE,
    title: 'Bike Veo Geofence',
    url: `${HOSTED_ROOT}/FBike_entry/FeatureServer/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.type'
    },
    native: hiddenNative()
  },

  // --- Pedestrian ---
  // The service publishes two layers named "Exit Routes": sublayer 3 is scoped to
  // `type = 'Pedestrian'`, while sublayer 4 is an unfiltered copy carrying Cyclist and Vehicle routes
  // as well. Sublayer 3 is the pedestrian map.
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PEDESTRIAN_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${HOSTED_ROOT}/Football_Pedestrian_Exit/FeatureServer/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: hiddenNative({ renderer: routeRenderer(ROUTE_COLORS.pedestrian) })
  }
];

export const FootballParkingConfiguration: EventConfiguration = {
  id: 'gameday-parking',
  name: 'Football',
  applicationName: 'Football Transportation',
  shortApplicationName: 'Football',
  introductionText: 'Get the best transportation and parking information for game days.',
  // 2026 home schedule (7 home dates at Kyle Field), per the SEC-released schedule:
  // 9/5 Missouri State, 9/12 Arizona State, 9/19 Kentucky, 10/3 Arkansas, 10/17 The Citadel,
  // 11/14 Tennessee, 11/27 Texas (Black Friday). https://12thman.com/news/2025/12/11/2026-texas-am-football-schedule-announced
  eventDates: [
    '2026-09-05',
    '2026-09-12',
    '2026-09-19',
    '2026-10-03',
    '2026-10-17',
    '2026-11-14',
    '2026-11-27'
  ],
  scheduleUrl: 'https://12thman.com/sports/football/schedule',
  mapCenter: [-96.34344, 30.61011],
  zoom: 16,
  defaultLayerOverrides: {
    'construction_zone-layer': {
      visible: false
    }
  },
  toast: {
    id: 'gameday-parking-notification',
    title: 'Football Transportation Map Available',
    message:
      'Attending the game? Click me to open the Football Transportation Map to get the best parking and transportation options for game day!',
    imgUrl: './assets/images/icons/sports/Football.png',
    imgAltText: 'Football Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/gameday-parking'
    }
  }
};

/** Turns every layer belonging to a vehicle mode on when that mode is selected. */
const vehicleModeTransportEffects = (mode: VehicleMode) =>
  Object.values(mode.layers).map((layerId) => ({
    layerId,
    conversions: [{ input: mode.transport, propOverrides: SHOW }]
  }));

/**
 * Hides the off-direction route layer for a vehicle mode. Both directions come on with the mode, so
 * the direction step only has to switch one off; the services are already scoped to their phase, so
 * no expression is needed. These conversions are inert for the modes that never turn them on.
 */
const vehicleModeDirectionEffects = (mode: VehicleMode) => [
  {
    layerId: mode.layers.entryRoutes,
    conversions: [{ input: Direction.EXIT, propOverrides: HIDE }]
  },
  {
    layerId: mode.layers.exitRoutes,
    conversions: [{ input: Direction.ENTRY, propOverrides: HIDE }]
  }
];

export const FootballParkingOptions: SpecialEventOptions = [
  {
    value: FootballBuilderOptions.TRANSPORT_TYPE,
    label: 'Transportation Type',
    description:
      'To provide you with the most relevant and accurate transportation and parking information, please select your mode of transportation on game day. This will help us tailor the map and information to your needs.',
    shortDescription: 'Transportation Type',
    choices: [
      {
        value: TransportType.PAY_AVP,
        label: 'Pay Upon Arrival/Any Valid Texas A&M Permit'
      },
      {
        value: TransportType.PARKMOBILE,
        label: 'ParkMobile Prepay'
      },
      {
        value: TransportType.TWELFTH_MAN,
        label: '12th Man'
      },
      {
        value: TransportType.PRESALE,
        label: 'Presale Season Parking'
      },
      {
        value: TransportType.RIDESHARE,
        label: 'Rideshare'
      },
      {
        value: TransportType.SHUTTLE,
        label: 'Shuttle'
      },
      {
        value: TransportType.RV,
        label: 'RV'
      },
      {
        value: TransportType.MICROMOBILITY,
        label: 'Micromobility'
      },
      {
        value: TransportType.PEDESTRIAN,
        label: 'Pedestrian'
      }
    ],
    effects: {
      layers: [
        ...VEHICLE_MODES.flatMap(vehicleModeTransportEffects),

        // Rideshare
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RIDESHARE_LOCATIONS,
          conversions: [{ input: TransportType.RIDESHARE, propOverrides: SHOW }]
        },
        // Shuttle
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_STOPS,
          conversions: [{ input: TransportType.SHUTTLE, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_ROUTES,
          conversions: [{ input: TransportType.SHUTTLE, propOverrides: SHOW }]
        },
        // RV
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_GAMEDAY_PARKING,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_RNS_SPACES,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_STRIPES,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_STREET_GRASS_AREAS,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_PARKING_LOTS,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        // Micromobility
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_PARKING,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_EXIT_ROUTES,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        {
          // Bike lanes only exist on the micromobility ENTRY service; the direction step hides them
          // on the exit map.
          layerId: FOOTBALL_PARKING_LAYERS.FP_BIKE_LANES,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_BIKE_DISMOUNT_ZONES,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_BIKE_VEO_GEOFENCE,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        // Pedestrian — departure only, so no direction step.
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PEDESTRIAN_EXIT_ROUTES,
          conversions: [{ input: TransportType.PEDESTRIAN, propOverrides: SHOW }]
        }
      ]
    }
  },
  {
    value: FootballBuilderOptions.DIRECTION,
    label: 'Direction',
    description:
      'Are you arriving at the game (Entry) or leaving afterward (Exit)? Choose one to see the routes tailored to your trip.',
    shortDescription: 'Direction',
    uiType: 'binary',
    // Only the modes that publish a separate arrival and departure service ask for a direction.
    visibleWhen: {
      setting: FootballBuilderOptions.TRANSPORT_TYPE,
      equalsAnyOf: [
        TransportType.PAY_AVP,
        TransportType.PARKMOBILE,
        TransportType.TWELFTH_MAN,
        TransportType.PRESALE,
        TransportType.MICROMOBILITY
      ]
    },
    choices: [
      {
        value: Direction.ENTRY,
        label: 'Entry'
      },
      {
        value: Direction.EXIT,
        label: 'Exit'
      }
    ],
    effects: {
      layers: [
        ...VEHICLE_MODES.flatMap(vehicleModeDirectionEffects),

        {
          // Micromobility exit routes come from the exit service; hide them on the entry map.
          layerId: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_EXIT_ROUTES,
          conversions: [{ input: Direction.ENTRY, propOverrides: HIDE }]
        },
        {
          // Bike lanes are entry-only; hide them on the micromobility exit map.
          layerId: FOOTBALL_PARKING_LAYERS.FP_BIKE_LANES,
          conversions: [{ input: Direction.EXIT, propOverrides: HIDE }]
        }
      ]
    }
  }
];

export const FootballParkingEvent: AggiemapCustomMapConfiguration = {
  configuration: FootballParkingConfiguration,
  options: FootballParkingOptions,
  sources: FootballParkingColdLayerSources,
  references: FOOTBALL_PARKING_LAYERS,
  type: 'special-event',
  discover: {
    id: FootballParkingConfiguration.id,
    name: FootballParkingConfiguration.name,
    description: 'Transportation and parking information for football game days.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: [
      'football',
      'gameday',
      'parking',
      'shuttles',
      'transportation',
      'bike',
      'micromobility',
      'pedestrian',
      '12th man',
      'rv',
      'rideshare',
      'parkmobile',
      'presale',
      'pay upon arrival',
      'avp'
    ]
  }
};
