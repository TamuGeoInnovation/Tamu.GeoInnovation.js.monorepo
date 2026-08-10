import { LayerSource } from '@tamu-gisc/common/types';
import { getDefaultGisHost, getDefaultGisHosts } from '@tamu-gisc/aggiemap/ngx/common';

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
 * The published data is migrating from one shared, client-filtered service to a set of per-mode
 * hosted services, each pre-filtered by Transportation Services to exactly what that mode's map
 * should show. Sources currently in play:
 *
 * 1. `Hosted/12thMan_view` + `Hosted/12thMan_2_view` — the 12th Man entry and exit maps.
 * 2. `Hosted/Football_Personal_Vehicle_Entry` — the Personal Vehicle entry map.
 * 3. `Hosted/Football_Personal_Vehicle_Exit` — the Personal Vehicle exit map.
 * 4. `Hosted/RV_view` — RV striping, reserved spaces and street/grass areas.
 * 5. `Hosted/Lots_view` (the parking-lot polygons + gameday parking point icons that Marcomm edits on game days).
 * 6. `Hosted/TSFootball_view` — Shuttle, Micromobility, Pedestrian and Pedicab.
 */
const gisHost = getDefaultGisHost();
const tsgisHost = getDefaultGisHosts().tsgisHost;

const footballPersonalVehicleEntryUrl =
  `https://${gisHost}/arcgis/rest/services/Hosted/Football_Personal_Vehicle_Entry/FeatureServer`;
const footballPersonalVehicleExitUrl =
  `https://${gisHost}/arcgis/rest/services/Hosted/Football_Personal_Vehicle_Exit/FeatureServer`;
const footballRvUrl = `https://${gisHost}/arcgis/rest/services/Hosted/RV_view/FeatureServer`;
const footballLotsUrl = `https://${gisHost}/arcgis/rest/services/Hosted/Lots_view/FeatureServer`;
const footballHostedUrl = `https://${tsgisHost}/arcgis/rest/services/Hosted/TSFootball_view/FeatureServer`;

/**
 * The 12th Man entry and exit services. Both are public and already filtered to `aggiemap = 1`, so the
 * layers below need no client-side query — the routes carry only `type = 'Vehicle'` with the matching
 * `pre_post` phase, and the lots only the 12th Man reserved types.
 *
 * `12thMan_view` (entry) publishes sublayers 0–3 and `12thMan_2_view` (exit) sublayers 1–3, dropping the
 * Entry Routes layer. Their Street/Grass Areas and Football Parking Lots sublayers are identical copies
 * (same 24 / 26 features, schema and symbology), so those two layers are sourced once from the entry
 * service and shown for both directions rather than duplicated per direction.
 */
const twelfthManEntryUrl = `https://${gisHost}/arcgis/rest/services/Hosted/12thMan_view/FeatureServer`;
const twelfthManExitUrl = `https://${gisHost}/arcgis/rest/services/Hosted/12thMan_2_view/FeatureServer`;

const TWELFTH_MAN_ENTRY_ROUTES_LAYER_INDEX = 0;
const TWELFTH_MAN_EXIT_ROUTES_LAYER_INDEX = 1;
const TWELFTH_MAN_STREET_GRASS_LAYER_INDEX = 2;
const TWELFTH_MAN_LOTS_LAYER_INDEX = 3;

/**
 * `Lots_view` is the PUBLIC view of the Marcomm-maintained hosted lots layer. The base `Hosted/Lots`
 * service is secured and prompts anonymous visitors to sign in, so the public view is used instead.
 *
 * Sublayer 0 = Gameday Parking (points), sublayer 1 = Football Parking Lots (polygons).
 * Field names on the view are lowercase (e.g. `type`, `twelfthman`, `name`, `note`, `lotname`,
 * `notes`, `notes_1`) and SQL where-clauses against it are case-sensitive.
 */
const LOTS_POLYGON_LAYER_INDEX = 1;

/**
 * Declaration order here IS the top-to-bottom map draw order. `EventService` reads this enum, reverses
 * it, then adds each layer with `map.add()` (no index), so ArcGIS appends bottom→top — the FIRST entry
 * ends up drawn on top, the LAST at the bottom. Keep the point icons (`FP_GAMEDAY_PARKING`) first so they
 * sit above the parking-lot polygons; keep the polygon lots (`FP_PARKING_LOTS`/`FP_12TH_MAN_LOTS`/
 * `FP_CHARTER_PARKING`/`FP_RV_PARKING`) last so they stay at the bottom.
 */
export enum FOOTBALL_PARKING_LAYERS {
  FP_GAMEDAY_PARKING = 'football-gameday-parking',
  FP_STRIPES = 'football-stripes',
  FP_RNS_SPACES = 'football-rns-spaces',
  FP_ENTRY_ROUTES = 'football-entry-routes',
  FP_PV_EXIT_ROUTES = 'football-pv-exit-routes',
  FP_EXIT_ROUTES = 'football-exit-routes',
  FP_12TH_MAN_ENTRY_ROUTES = 'football-12th-man-entry-routes',
  FP_12TH_MAN_EXIT_ROUTES = 'football-12th-man-exit-routes',
  FP_STREET_GRASS_AREAS = 'football-street-grass-areas',
  FP_PV_STREET_GRASS_AREAS = 'football-pv-street-grass-areas',
  FP_12TH_MAN_STREET_GRASS_AREAS = 'football-12th-man-street-grass-areas',
  FP_SHUTTLE_STOPS = 'football-shuttle-stops',
  FP_SHUTTLE_ROUTES = 'football-shuttle-routes',
  FP_MICROMOBILITY_PARKING = 'football-micromobility-parking',
  FP_BIKE_DISMOUNT_ZONES = 'football-bike-dismount-zones',
  FP_BIKE_VEO_GEOFENCE = 'football-bike-veo-geofence',
  FP_BIKE_LANES = 'football-bike-lanes',
  FP_PEDICAB_STOPS = 'football-pedicab-stops',
  FP_PEDICAB_ROUTES = 'football-pedicab-routes',
  FP_PEDICAB_CLOSURES = 'football-pedicab-closures',
  FP_PARKING_LOTS = 'football-parking-lots',
  FP_12TH_MAN_LOTS = 'football-12th-man-lots',
  FP_CHARTER_PARKING = 'football-charter-parking',
  FP_RV_PARKING = 'football-rv-parking'
}

/**
 * The user-selectable transportation modes (the first builder step).
 *
 * `PEDICAB` is intentionally defined here (layers + effects are wired) but omitted from the builder choices
 * below until it is approved to appear on AggieMap.
 */
enum TransportType {
  TWELFTH_MAN = '12th-man',
  SHUTTLE = 'shuttle',
  RV = 'rv',
  PERSONAL_VEHICLE = 'personal-vehicle',
  MICROMOBILITY = 'micromobility',
  PEDESTRIAN = 'pedestrian',
  PEDICAB = 'pedicab'
}

/**
 * The Entry/Exit sub-choice (the second, conditional builder step). Only shown for the modes that have a
 * meaningfully different arrival vs departure map.
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

/**
 * The route layers publish from the service as flat, thick solid lines (a "green blob") — the arrow
 * symbology from ArcGIS Pro isn't carried in the exported service renderer. Re-symbolize them as thin
 * directional lines with an arrowhead at the end. Colors follow the travel `Type` so the shared
 * Entry/Exit Routes layers render green (vehicle), purple (cyclist), or blue (pedestrian) per mode.
 */
const ROUTE_COLORS = {
  vehicle: 'rgb(38, 115, 0)',
  cyclist: 'rgb(112, 48, 160)',
  pedestrian: 'rgb(0, 92, 230)'
};

/** A solid line with a direction arrow at its end, used to re-symbolize the flat route/arrow layers. */
const arrowLineSymbol = (color: string, width = 3): esri.SimpleLineSymbolProperties => ({
  type: 'simple-line',
  color,
  width,
  style: 'solid',
  marker: { style: 'arrow', color, placement: 'end' }
});

/** A solid polygon fill with a matching outline, used for the categorized Football Parking Lots renderer. */
const lotFillSymbol = (fill: number[], outline: number[]): esri.SimpleFillSymbolProperties => ({
  type: 'simple-fill',
  color: fill,
  outline: { color: outline, width: 1 }
});

/**
 * Football Parking Lots categories (mirrors the `Lots_view` service renderer, keyed on `type`). Defining
 * the renderer explicitly makes it available synchronously — the map factory otherwise only picks up the
 * service renderer after an async load, so the legend can build before the categories exist. Many `type`
 * values collapse to a few labeled categories; the legend's `deduplicate` merges the repeated labels and
 * `respectDefinitionExpression` hides categories not present under a mode's filter.
 */
const LOT_RESERVED_SYMBOL = lotFillSymbol([244, 162, 97, 255], [230, 124, 0, 255]);
const LOT_PERMIT_SYMBOL = lotFillSymbol([94, 137, 234, 255], [94, 52, 234, 255]);
const LOT_CHARTER_SYMBOL = lotFillSymbol([0, 167, 116, 255], [0, 120, 84, 255]);
const LOT_PAID_SYMBOL = lotFillSymbol([76, 230, 0, 255], [110, 110, 110, 255]);
const LOT_FULL_SYMBOL = lotFillSymbol([230, 0, 0, 255], [168, 0, 0, 255]);

/** The 12th Man reserved-lot blue authored on `12thMan_view`, mirrored so the legend builds synchronously. */
const LOT_TWELFTH_MAN_SYMBOL = lotFillSymbol([35, 68, 156, 255], [35, 68, 156, 255]);

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

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

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

const streetClosureUniqueValueInfo = {
  value: 'AreaClosed',
  label: 'Street Closures',
  symbol: streetClosureHatchSymbol
};

const reservedTailgateUniqueValueInfo = {
  value: 'Tailgate',
  label: 'Reserved Tailgate',
  symbol: reservedTailgateHatchSymbol
};

// The FeatureServer metadata publishes Street Closures as a solid fill, while the portal items carry
// the authored hatch renderer shown in Map Viewer. Reproduce those item-level renderer overrides here.
const footballRvStreetGrassRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [streetClosureUniqueValueInfo, reservedTailgateUniqueValueInfo]
} as unknown as FeatureRenderer;

const footballPersonalVehicleStreetGrassRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    streetClosureUniqueValueInfo,
    {
      value: 'Permit Required',
      label: 'Permit Required',
      symbol: permitRequiredHatchSymbol
    },
    reservedTailgateUniqueValueInfo
  ]
} as unknown as FeatureRenderer;

const personalVehicleReservedLotSymbol = {
  type: 'cim',
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPolygonSymbol',
      symbolLayers: [
        {
          type: 'CIMHatchFill',
          enable: true,
          rotation: 90,
          separation: 2.5,
          lineSymbol: {
            type: 'CIMLineSymbol',
            symbolLayers: [
              {
                type: 'CIMSolidStroke',
                enable: true,
                color: [0, 0, 0, 255],
                width: 0.5
              }
            ]
          }
        }
      ]
    }
  }
} as unknown as esri.SymbolProperties;

const footballPersonalVehicleLotsRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    {
      value: 'Pay Upon Arrival',
      label: 'Pay Upon Arrival',
      symbol: lotFillSymbol([81, 179, 54, 255], [68, 137, 112, 255])
    },
    {
      value: 'Pay Upon Arrival/Any Valid A&M Permit',
      label: 'Pay Upon Arrival/Any Valid A&M Permit',
      symbol: lotFillSymbol([0, 166, 113, 255], [0, 115, 76, 255])
    },
    {
      value: 'AVP',
      label: 'Any Valid Texas A&M Permit',
      symbol: LOT_PERMIT_SYMBOL
    },
    {
      value: 'SPresale',
      label: 'Season Presale',
      symbol: lotFillSymbol([35, 68, 156, 255], [35, 68, 156, 255])
    },
    {
      value: 'Charter',
      label: 'Charter Bus',
      symbol: LOT_RESERVED_SYMBOL
    },
    {
      value: 'RV',
      label: 'Reserved Parking',
      symbol: personalVehicleReservedLotSymbol
    },
    {
      value: 'Reserved Athletic',
      label: 'Reserved Parking',
      symbol: personalVehicleReservedLotSymbol
    },
    {
      value: 'Reserved',
      label: 'Reserved Parking',
      symbol: personalVehicleReservedLotSymbol
    }
  ]
} as unknown as FeatureRenderer;

const createPictureMarkerSymbol = (
  imageData: string,
  width = 25,
  height = 30
): esri.SymbolProperties =>
  ({
    type: 'picture-marker',
    url: `data:image/png;base64,${imageData}`,
    width,
    height
  }) as unknown as esri.SymbolProperties;

const footballGamedayParkingRenderer = {
  type: 'unique-value',
  field: 'notes',
  fieldDelimiter: ',',
  uniqueValueInfos: [
    {
      value: 'Disabled',
      label: 'Accessible Parking',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: '12th Man Lot',
      label: '12th Man Lot',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'GPresale',
      label: 'ParkMobile Presale',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'AVP',
      label: 'AVP',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'Paid Parking',
      label: 'Paid Parking',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'Presale',
      label: 'Presale',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'RV',
      label: 'RV',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'Rideshare Location',
      label: 'Rideshare Location',
      symbol: createPictureMarkerSymbol(
        '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'
      )
    },
    {
      value: 'Alert',
      label: 'Alert',
      symbol: createPictureMarkerSymbol(
        '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',
        24,
        30
      )
    },
    {
      value: 'Road Closed',
      label: 'Road Closed',
      symbol: createPictureMarkerSymbol(
        'iVBORw0KGgoAAAANSUhEUgAAABYAAAAbCAYAAAB4Kn/lAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEkElEQVRIicWWe0xTZxiHf+fSm5RSoNgBIlouUS46nMyg6QzMKYyBLgOX6NQFsrEx55ZpjNnMJmxZYtzYH6jZzZkpiOucytwcbDqXKAk4LgLKFEYLs9SWlnJpS2lPzzlLSzCAJcKWZc8/5+T93u/JyXve95yPxn8E/X+IablYHMmB28EzbCYAoTdIAFZCIjrLgjxrt9stALi5iBctj1OdzyX5aKULgQIPS4AH6V3gSbBumn5SH0iXfKm3tFmt1k0AHA8V0zS9dnPMQs1qNx8qZDlKmZaMuGeex7zwUN+6Q99P3T53EqLGrvnvyoPTq+WSG1e0fRsAaGcUy2SyVXlLFtes6hsUyWOjibTSdxD1hHfPVBJ27ED3j9+iofQQlWcyq6wRisZWgyUJgMGfWBQdIDq1qm9QLF0Qhpwz30CiCIfT0g/dxTMwtjaCpAVYlJGFyDUZiMnOR0jcUlRv3EwWe7jgg4+ElWuN5jxvtaaLC7eFyUOJQQZZlRU+ae+vF3Hp5TfAjrnvJ3WeqoFQKkXu9xqExCchW1OJ808/i8yoiOyjRvNqAHWTxVL1ElVW0IArKHL9SshV8TDdaMClol1gx5ipdeABt82On7ZsR/7lX6BIWIbQFBWS27Xk4qgFm3R39fUA2AlxQODAUCqEUqhLDoIgSNw6dhysc5p0Eo57FnRUVeLRotexYuer+LlgjyA2SJiiAwIAjEyIKcrFKgUKCQKjYn2B/vZWKB9LxsbqH/yKT6vTYGq4DhQBi9bng6D2QjRsUwAQPNAVk2HsDkiCxltsNlBieko3T4g5jiLsnlGXdGIhOEaF/pY/8N36dX5FDoMZUekZ4/d9WngcbnjmiQe99Z0sdjJh8hbewal/L9uP1Lc+gCo3F4a6Fgx0dPkVkwISqhzvpANNRz/yXQ0Q9gIYnSy2NVvtV3KDZamt5VXiZYW7kbC1AMamBvypqXlASlAkUna9hPBUNUbNRnRW1uCeUjrU1txRC8A9pRQWi+WrKrH47e08icayUqw+8DEyyj5D+MojqC8th8fpBkEAgsAAZFd8DsXyNPA8h2sH9oDzsKjQ3h0GUDW9xl562wcthaak2CM4dlbqGWWw9tBhLN3yGuKfK8TYoAUESUESGgaCGt925c1X0FN9Fc3RSmfPdcNWTGJKV4w4xk4f7jY+tU8m23yn6oLQ3NaBxIIXsFCdjoCIxb4ch0EH3aVa3Dx2AiPdfdBLafsX9U3vcRxXN6MYgLvfYnlRMz8keRvHJ1lvdVNXd5cAKIFYKQPHeOC2+t6ND5uQ5j612n7jOO6TaR6/fczWd3RuUEQo2nKIefMngmOmkSlJPEnw50XoMuvMOX4cMw6IqdY8vFeVGHE80TxE+Eu4QIO5dlvr/Zr5ZebJY5ivNbruxH2R4cWSYbd3/u/TEx7sbNLpiwHcnLPYi3HY8X6Z2Ja5VyROErC878ltEmqsvL2j0u5iTuJf/KVtf5lMay4/nnxnnckWzJIEf4Km9XYXs3NidP+pGF75uevtK2oFgg8JEkMOF7MfgOthm2Z7rjCOMkzBLHPnJJ4zfwOE9saA3JIxeQAAAABJRU5ErkJggg==',
        16,
        20
      )
    }
  ]
} as unknown as FeatureRenderer;

export const FootballParkingColdLayerSources: LayerSource[] = [
  // --- RV striping + reserved spaces (RV mode) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_STRIPES,
    title: 'Stripes',
    url: `${footballRvUrl}/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.use_',
      description: 'attributes.location'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RNS_SPACES,
    title: 'RNS Spaces',
    url: `${footballRvUrl}/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.rv_spcnum',
      description: 'attributes.spc_type'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Entry / Exit routes (Personal Vehicle, Micromobility, Pedestrian) ---
  // The Personal Vehicle entry route layer is already scoped by its hosted service. The shared hosted
  // exit layer handles the other route modes.
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_ENTRY_ROUTES,
    title: 'Entry Routes',
    url: `${footballPersonalVehicleEntryUrl}/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // The hosted entry service is already scoped to the vehicle pre-game route set, but its renderer
      // still exports as a thick solid line. Re-symbolize it as a thin directional arrow.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle, 2) }]
      }
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PV_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${footballPersonalVehicleExitUrl}/2`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // The hosted view is already scoped to vehicle post-game routes. Preserve the existing thin
      // directional exit symbology instead of its published 15px solid line.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) }]
      }
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${footballHostedUrl}/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // The hosted layer is shared by Micromobility (Cyclist) and Pedestrian, so color the directional
      // arrows by `type`.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [
          { value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) },
          { value: 'Cyclist', symbol: arrowLineSymbol(ROUTE_COLORS.cyclist) },
          { value: 'Pedestrian', symbol: arrowLineSymbol(ROUTE_COLORS.pedestrian) }
        ]
      }
    }
  },

  // --- 12th Man entry / exit routes (Hosted/12thMan_view + Hosted/12thMan_2_view) ---
  // Both views are already scoped to `type = 'Vehicle'` and the matching `pre_post` phase, so unlike the
  // shared cache route layers above these need no query — the `direction` step only toggles visibility.
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_ENTRY_ROUTES,
    title: 'Entry Routes',
    url: `${twelfthManEntryUrl}/${TWELFTH_MAN_ENTRY_ROUTES_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // The view publishes these as flat 15px solid green lines (the same "green blob" as the cache
      // layers), so re-symbolize them as thin directional arrows. Field casing is lowercase here.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) }]
      }
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${twelfthManExitUrl}/${TWELFTH_MAN_EXIT_ROUTES_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.location',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) }]
      }
    }
  },

  // --- Street / grass areas (RV; Personal Vehicle gets a hosted copy below; 12th Man uses its own) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    title: 'Street/Grass Areas (Click for details)',
    url: `${footballRvUrl}/2`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.anote'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: footballRvStreetGrassRenderer
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PV_STREET_GRASS_AREAS,
    title: 'Street/Grass Areas (Click for details)',
    url: `${footballPersonalVehicleEntryUrl}/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.anote'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: footballPersonalVehicleStreetGrassRenderer
    }
  },
  {
    // The 12th Man portal item uses the same authored hatch renderer as the RV portal item.
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_STREET_GRASS_AREAS,
    title: 'Street/Grass Areas (Click for details)',
    url: `${twelfthManEntryUrl}/${TWELFTH_MAN_STREET_GRASS_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.anote'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: footballRvStreetGrassRenderer
    }
  },

  // --- Shuttle stops + routes (Shuttle) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_STOPS,
    title: 'Campus Shuttle Stops',
    url: `${footballHostedUrl}/5`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.stopname}',
      description: 'For route: {attributes.routename}'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_ROUTES,
    title: 'Shuttle Routes',
    url: `${footballHostedUrl}/6`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.routename} ({attributes.routenum})'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Micromobility (Bike) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_PARKING,
    title: 'Micromobility Parking Area',
    url: `${footballHostedUrl}/7`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.type',
      description: 'attributes.br_notes'
    },
    // Same pin-stretch bug as the Gameday Parking icons: the picture marker is a pin (natural 60x73,
    // ~0.82 ratio) forced into a 30x30 square by the service renderer, so it stretches wide on the map
    // and in the legend swatch. Re-render both at a matching ~0.82 ratio (25x30). `EsriMapService`
    // applies these width/height hints to the on-map picture marker too (`applyLegendOverrideToLayerSymbols`).
    legend: {
      mode: 'renderer-symbol',
      preserveAspectRatio: true,
      fit: 'contain',
      width: 25,
      height: 30
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_DISMOUNT_ZONES,
    title: 'Bike Dismount Zones',
    url: `${footballHostedUrl}/8`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.bike_notes'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_VEO_GEOFENCE,
    title: 'Bike Veo Geofence',
    url: `${footballHostedUrl}/9`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.type'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_BIKE_LANES,
    title: 'Bike Lanes',
    url: `${footballHostedUrl}/10`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.use_',
      description: 'attributes.location'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Pedicab (built but kept off the builder/AggieMap until approved) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_STOPS,
    title: 'Pedicab Drop Off/Pick Up',
    url: `${footballHostedUrl}/11`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_ROUTES,
    title: 'Pedicab Routes',
    url: `${footballHostedUrl}/12`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // Directional arrows colored by pedicab trip phase, matching the service's Arrival/Departure scheme.
      renderer: {
        type: 'unique-value',
        field: 'edited',
        uniqueValueInfos: [
          { value: 'Arrival', symbol: arrowLineSymbol('rgb(56, 168, 0)') },
          { value: 'Departure', symbol: arrowLineSymbol('rgb(230, 152, 0)') },
          { value: 'Arrival/Departure', symbol: arrowLineSymbol('rgb(0, 92, 230)') }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_CLOSURES,
    title: 'Pedicab Closures',
    url: `${footballHostedUrl}/13`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.event',
      description: 'attributes.notes'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Parking lots (Hosted/Lots, token-gated, Marcomm-maintained) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    title: 'Football Parking Lots',
    url: `${footballPersonalVehicleEntryUrl}/4`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: footballPersonalVehicleLotsRenderer,
      labelingInfo: [
        {
          // 12th Man lots show their pass letter on a second line.
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
          // Non-12th-Man lots with a price embedded in the type string (e.g. "Public $30").
          labelExpressionInfo: {
            expression:
              "var t=$feature.type; var p=''; if(t!=null && t!='' && Find('$', t)>-1){ var i=Find('$', t); var seg=Mid(t,i,10); var sp=Find(' ', seg); if(sp>-1){ seg=Left(seg, sp);} var last=Right(seg,1); if(last=='-' || last==':' || last==',' ){ seg=Left(seg, Length(seg)-1);} p=seg; } $feature.name + IIf(p=='','', ' - '+p);"
          },
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: lotLabelSymbol,
          minScale: 9500,
          maxScale: 0,
          where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND type IS NOT NULL AND type LIKE '%$%' AND type <> 'AVP'"
        },
        {
          labelExpression: '[name]',
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: lotLabelSymbol,
          minScale: 9500,
          maxScale: 0,
          where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND (type IS NULL OR type NOT LIKE '%$%' OR type = 'AVP')"
        }
      ]
    }
  },
  {
    // 12th Man parking lots, from the hosted 12th Man view. The view is already scoped to the reserved
    // types, so no `type` filter is needed — and because only one labeled category is drawn, the legend
    // shows just "12th Man Reserved Parking" instead of the full color key that `FP_PARKING_LOTS` keeps
    // for Personal Vehicle. Field names are lowercase here, matching `Lots_view`.
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_LOTS,
    title: 'Football Parking Lots',
    url: `${twelfthManEntryUrl}/${TWELFTH_MAN_LOTS_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [
          { value: 'Reserved Athletic', label: '12th Man Reserved Parking', symbol: LOT_TWELFTH_MAN_SYMBOL },
          { value: 'Reserved', label: '12th Man Reserved Parking', symbol: LOT_TWELFTH_MAN_SYMBOL },
          { value: 'RV', label: '12th Man Reserved Parking', symbol: LOT_TWELFTH_MAN_SYMBOL },
          { value: 'SPresale', label: '12th Man Reserved Parking', symbol: LOT_TWELFTH_MAN_SYMBOL }
        ]
      },
      // The view publishes no labels, so carry over the lot labeling: 12th Man lots show their parking
      // pass letter on a second line, the rest just the lot name.
      labelingInfo: [
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
          labelExpression: '[name]',
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: lotLabelSymbol,
          minScale: 9500,
          maxScale: 0,
          where: "twelfthman IS NULL OR TRIM(twelfthman) = ''"
        }
      ]
    }
  },
  {
    // Same polygon layer as FP_PARKING_LOTS, but scoped to charter lots and titled for the Shuttle map.
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_CHARTER_PARKING,
    title: 'Charter Bus Parking',
    url: `${footballLotsUrl}/${LOTS_POLYGON_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      definitionExpression: "type = 'Charter'",
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'Charter', label: 'Charter Bus', symbol: LOT_CHARTER_SYMBOL }]
      }
    }
  },
  {
    // The hosted RV view is already scoped to RV lots and publishes the authoritative symbology.
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_PARKING,
    title: 'Football Parking Lots',
    url: `${footballRvUrl}/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_PARKING,
    title: 'Gameday Parking',
    url: `${footballPersonalVehicleEntryUrl}/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.notes',
      description: 'attributes.notes_1'
    },
    legend: {
      mode: 'renderer-symbol',
      preserveAspectRatio: true,
      fit: 'contain',
      width: 25,
      height: 30
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      renderer: footballGamedayParkingRenderer
    }
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

export const FootballParkingOptions: SpecialEventOptions = [
  {
    value: FootballBuilderOptions.TRANSPORT_TYPE,
    label: 'Transportation Type',
    description:
      'To provide you with the most relevant and accurate transportation and parking information, please select your mode of transportation on game day. This will help us tailor the map and information to your needs.',
    shortDescription: 'Transportation Type',
    choices: [
      {
        value: TransportType.TWELFTH_MAN,
        label: '12th Man'
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
        value: TransportType.PERSONAL_VEHICLE,
        label: 'Personal Vehicle'
      },
      {
        value: TransportType.MICROMOBILITY,
        label: 'Micromobility'
      },
      {
        value: TransportType.PEDESTRIAN,
        label: 'Pedestrian'
      }
      // Pedicab is wired below but hidden from the builder until approved to appear on AggieMap.
      // {
      //   value: TransportType.PEDICAB,
      //   label: 'Pedicab'
      // }
    ],
    effects: {
      layers: [
        // RV
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_STRIPES,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RNS_SPACES,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        // Personal Vehicle entry routes come from the hosted entry service.
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_ENTRY_ROUTES,
          conversions: [{ input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }]
        },
        {
          // The hosted exit view is pre-filtered to Personal Vehicle post-game routes.
          layerId: FOOTBALL_PARKING_LAYERS.FP_PV_EXIT_ROUTES,
          conversions: [{ input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }]
        },
        // The shared hosted exit layer serves Micromobility and Pedestrian. Pedestrian is fully
        // self-contained and therefore does not show the direction step.
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
          conversions: [
            { input: TransportType.MICROMOBILITY, expression: "type = 'Cyclist'", propOverrides: SHOW },
            {
              input: TransportType.PEDESTRIAN,
              expression: "type = 'Pedestrian' AND pre_post = 'Post-Game'",
              propOverrides: SHOW
            }
          ]
        },
        // 12th Man routes: both directions come on with the mode, and the direction step hides one of them.
        // No expressions — the hosted views are pre-filtered to the vehicle routes for their phase.
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_ENTRY_ROUTES,
          conversions: [{ input: TransportType.TWELFTH_MAN, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_EXIT_ROUTES,
          conversions: [{ input: TransportType.TWELFTH_MAN, propOverrides: SHOW }]
        },
        // Street / grass areas
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PV_STREET_GRASS_AREAS,
          conversions: [{ input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_STREET_GRASS_AREAS,
          conversions: [{ input: TransportType.TWELFTH_MAN, propOverrides: SHOW }]
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
        // Micromobility
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_MICROMOBILITY_PARKING,
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
        {
          // Bike lanes only appear on the micromobility ENTRY map; the direction step hides them on exit.
          layerId: FOOTBALL_PARKING_LAYERS.FP_BIKE_LANES,
          conversions: [{ input: TransportType.MICROMOBILITY, propOverrides: SHOW }]
        },
        // Pedicab (hidden mode)
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_STOPS,
          conversions: [{ input: TransportType.PEDICAB, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_ROUTES,
          conversions: [{ input: TransportType.PEDICAB, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_PEDICAB_CLOSURES,
          conversions: [{ input: TransportType.PEDICAB, propOverrides: SHOW }]
        },
        // Parking lots (per-mode filter)
        {
          // Personal Vehicle uses the shared lots layer (full color key via ignoreDefinitionExpression);
          // 12th Man and RV use their own layers so each legend stays scoped to that mode's categories.
          layerId: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
          conversions: [{ input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_LOTS,
          conversions: [{ input: TransportType.TWELFTH_MAN, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_RV_PARKING,
          conversions: [{ input: TransportType.RV, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_CHARTER_PARKING,
          conversions: [{ input: TransportType.SHUTTLE, propOverrides: SHOW }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_PARKING,
          conversions: [{ input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }]
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
    // Only the modes with a meaningfully different arrival vs departure map ask for a direction.
    visibleWhen: {
      setting: FootballBuilderOptions.TRANSPORT_TYPE,
      equalsAnyOf: [TransportType.TWELFTH_MAN, TransportType.PERSONAL_VEHICLE, TransportType.MICROMOBILITY]
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
        {
          // Entry map: keep Entry Routes (adding the pre-game clause), hide Exit Routes.
          layerId: FOOTBALL_PARKING_LAYERS.FP_ENTRY_ROUTES,
          conversions: [
            { input: Direction.ENTRY, expression: "Pre_Post = 'Pre-Game'" },
            { input: Direction.EXIT, propOverrides: HIDE }
          ]
        },
        {
          // Personal Vehicle exit comes from a post-game-only hosted view, so direction only toggles it.
          layerId: FOOTBALL_PARKING_LAYERS.FP_PV_EXIT_ROUTES,
          conversions: [
            { input: Direction.EXIT },
            { input: Direction.ENTRY, propOverrides: HIDE }
          ]
        },
        {
          // Micromobility exit uses the shared hosted layer; add the post-game clause and hide it on entry.
          layerId: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
          conversions: [
            { input: Direction.EXIT, expression: "pre_post = 'Post-Game'" },
            { input: Direction.ENTRY, propOverrides: HIDE }
          ]
        },
        // The 12th Man route layers come from direction-specific services, so the direction only has to
        // hide the one that doesn't apply. (These conversions are inert for the other modes, which never
        // turn these layers on.)
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_ENTRY_ROUTES,
          conversions: [{ input: Direction.EXIT, propOverrides: HIDE }]
        },
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_12TH_MAN_EXIT_ROUTES,
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
      'rv'
    ]
  }
};
