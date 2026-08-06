import { LayerSource } from '@tamu-gisc/common/types';

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
 * Data comes from two services:
 *
 * 1. `TSFootball_Cache` (all transportation layers except the parking lots / gameday parking icons).
 * 2. `Hosted/Lots_view` (the parking-lot polygons + gameday parking point icons that Marcomm edits on game days).
 *
 * NOTE on the transportation source: the spec calls for `Hosted/Football_view/FeatureServer`, but that
 * service returns "Token Required" for anonymous users (prod AND dev), which would pop an ArcGIS sign-in
 * on AggieMap — the same problem that forced the public `Lots_view`. Until a PUBLIC view of the football
 * transportation layers exists, the only anonymously-readable source is the dev `TSFootball_Cache`
 * MapServer, whose 14 sublayers (0–13) match the spec's layer names exactly.
 * TODO: point `tsFootballCacheUrl` at the public `Football_view` (or a prod cache) once one is shared
 * publicly — and re-verify sublayer indices + field casing against it, as they may differ from the cache.
 */
const tsFootballCacheUrl = 'https://gis.dev.tamu.edu/arcgis/rest/services/TS/TSFootball_Cache/MapServer';
const footballLotsUrl = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Lots_view/FeatureServer';

/**
 * `Lots_view` is the PUBLIC view of the Marcomm-maintained hosted lots layer. The base `Hosted/Lots`
 * service is secured and prompts anonymous visitors to sign in, so the public view is used instead.
 *
 * Sublayer 0 = Gameday Parking (points), sublayer 1 = Football Parking Lots (polygons).
 * Field names on the view are lowercase (e.g. `type`, `twelfthman`, `name`, `note`, `lotname`,
 * `notes`, `notes_1`) and SQL where-clauses against it are case-sensitive.
 */
const GAMEDAY_PARKING_POINT_LAYER_INDEX = 0;
const LOTS_POLYGON_LAYER_INDEX = 1;

/**
 * Declaration order here IS the top-to-bottom map draw order. `EventService` reads this enum, reverses
 * it, then adds each layer with `map.add()` (no index), so ArcGIS appends bottom→top — the FIRST entry
 * ends up drawn on top, the LAST at the bottom. Keep the point icons (`FP_GAMEDAY_PARKING`) first so they
 * sit above the parking-lot polygons; keep the polygon lots (`FP_PARKING_LOTS`/`FP_CHARTER_PARKING`/
 * `FP_RV_PARKING`) last so they stay at the bottom.
 */
export enum FOOTBALL_PARKING_LAYERS {
  FP_GAMEDAY_PARKING = 'football-gameday-parking',
  FP_STRIPES = 'football-stripes',
  FP_RNS_SPACES = 'football-rns-spaces',
  FP_ENTRY_ROUTES = 'football-entry-routes',
  FP_EXIT_ROUTES = 'football-exit-routes',
  FP_STREET_GRASS_AREAS = 'football-street-grass-areas',
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
const arrowLineSymbol = (color: string): esri.SimpleLineSymbolProperties => ({
  type: 'simple-line',
  color,
  width: 3,
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

export const FootballParkingColdLayerSources: LayerSource[] = [
  // --- RV striping + reserved spaces (RV mode) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_STRIPES,
    title: 'Stripes',
    url: `${tsFootballCacheUrl}/0`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Use_',
      description: 'attributes.Location'
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
    url: `${tsFootballCacheUrl}/1`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.RV_SpcNum',
      description: 'attributes.Spc_Type'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Entry / Exit routes (12th Man, Personal Vehicle, Micromobility, Pedestrian) ---
  // Base source has no query/visibility; `transport-type` sets the `Type` filter + turns it on, and the
  // `direction` step appends the `Pre_Post` clause and hides the off-direction layer.
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_ENTRY_ROUTES,
    title: 'Entry Routes',
    url: `${tsFootballCacheUrl}/2`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Location',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // Entry Routes only ever show Vehicle routes here, so a single green directional arrow suffices.
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [{ value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) }]
      }
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
    title: 'Exit Routes',
    url: `${tsFootballCacheUrl}/3`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Location',
      description: 'attributes.Description'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // Exit Routes are shared by 12th Man/Personal Vehicle (Vehicle), Micromobility (Cyclist) and
      // Pedestrian, so color the directional arrows by `Type` — each mode filters to one type.
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          { value: 'Vehicle', symbol: arrowLineSymbol(ROUTE_COLORS.vehicle) },
          { value: 'Cyclist', symbol: arrowLineSymbol(ROUTE_COLORS.cyclist) },
          { value: 'Pedestrian', symbol: arrowLineSymbol(ROUTE_COLORS.pedestrian) }
        ]
      }
    }
  },

  // --- Street / grass areas (12th Man, RV, Personal Vehicle) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
    title: 'Street/Grass Areas (Click for details)',
    url: `${tsFootballCacheUrl}/4`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.aNote'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Shuttle stops + routes (Shuttle) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_SHUTTLE_STOPS,
    title: 'Campus Shuttle Stops',
    url: `${tsFootballCacheUrl}/5`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.StopName}',
      description: 'For route: {attributes.RouteName}'
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
    url: `${tsFootballCacheUrl}/6`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.RouteName} ({attributes.RouteNum})'
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
    url: `${tsFootballCacheUrl}/7`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.BR_Notes'
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
    url: `${tsFootballCacheUrl}/8`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Bike_Notes'
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
    url: `${tsFootballCacheUrl}/9`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Name',
      description: 'attributes.Type'
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
    url: `${tsFootballCacheUrl}/10`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Use_',
      description: 'attributes.Location'
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
    url: `${tsFootballCacheUrl}/11`,
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
    url: `${tsFootballCacheUrl}/12`,
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
    url: `${tsFootballCacheUrl}/13`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Event',
      description: 'attributes.Notes'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide'
    }
  },

  // --- Parking lots + gameday parking icons (Hosted/Lots, token-gated, Marcomm-maintained) ---
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
    title: 'Football Parking Lots',
    url: `${footballLotsUrl}/${LOTS_POLYGON_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.lotname',
      description: 'attributes.note'
    },
    // Always show the full color key (Reserved/Permit/Charter/Paid/Lot Full) even though each mode
    // filters the drawn lots to one type — the legend is a reference, not a mirror of what's drawn.
    legend: { ignoreDefinitionExpression: true },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // Categorize lots so the map + legend show Reserved Parking / Any Valid Texas A&M Permit /
      // Charter Bus / Paid Parking (and Lot Full when a lot is closed). Mirrors the Lots_view renderer.
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [
          { value: 'Reserved Athletic', label: 'Reserved Parking', symbol: LOT_RESERVED_SYMBOL },
          { value: 'Reserved', label: 'Reserved Parking', symbol: LOT_RESERVED_SYMBOL },
          { value: 'RV', label: 'Reserved Parking', symbol: LOT_RESERVED_SYMBOL },
          { value: 'SPresale', label: 'Reserved Parking', symbol: LOT_RESERVED_SYMBOL },
          { value: 'AVP', label: 'Any Valid Texas A&M Permit', symbol: LOT_PERMIT_SYMBOL },
          { value: 'Charter', label: 'Charter Bus', symbol: LOT_CHARTER_SYMBOL },
          { value: 'ParkMobile', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public $20', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public $25', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public $30', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public $40', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Public $G', label: 'Paid Parking', symbol: LOT_PAID_SYMBOL },
          { value: 'Lot Full', label: 'Lot Full', symbol: LOT_FULL_SYMBOL }
        ]
      },
      // Field names on the Lots_view polygon layer are lowercase and case-sensitive in SQL where-clauses.
      labelingInfo: [
        {
          // twelfthman lots (treat blank or single space as empty; anything else shows second line)
          labelExpressionInfo: {
            expression: '$feature.name + TextFormatting.NewLine + $feature.twelfthman'
          },
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
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
          },
          minScale: 9500,
          maxScale: 0,
          where: "twelfthman IS NOT NULL AND TRIM(twelfthman) <> ''"
        },
        {
          // Non-twelfthman lots with a price embedded in type (e.g. "Public $30")
          labelExpressionInfo: {
            expression:
              "var t=$feature.type; var p=''; if(t!=null && t!='' && Find('$', t)>-1){ var i=Find('$', t); var seg=Mid(t,i,10); var sp=Find(' ', seg); if(sp>-1){ seg=Left(seg, sp);} var last=Right(seg,1); if(last=='-' || last==':' || last==',' ){ seg=Left(seg, Length(seg)-1);} p=seg; } $feature.name + IIf(p=='','', ' - '+p);"
          },
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
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
          },
          minScale: 9500,
          maxScale: 0,
          where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND type IS NOT NULL AND type LIKE '%$%' AND type <> 'AVP'"
        },
        {
          // Fallback: non-priced, non-twelfthman
          labelExpression: '[name]',
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
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
          },
          minScale: 9500,
          maxScale: 0,
          where: "(twelfthman IS NULL OR TRIM(twelfthman) = '') AND (type IS NULL OR type NOT LIKE '%$%' OR type = 'AVP')"
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
    // Dedicated RV lots layer (same polygon service, scoped to RV). It has its own single-category
    // renderer and is NOT flagged with `ignoreDefinitionExpression`, so the RV map's legend shows only
    // "Reserved Parking" — unlike FP_PARKING_LOTS, which shows the full color key for 12th Man / Personal
    // Vehicle. RV is wired to this layer instead of FP_PARKING_LOTS for that reason.
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_RV_PARKING,
    title: 'Football Parking Lots',
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
      definitionExpression: "type = 'RV'",
      renderer: {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [{ value: 'RV', label: 'Reserved Parking', symbol: LOT_RESERVED_SYMBOL }]
      },
      labelingInfo: [
        {
          labelExpression: '[name]',
          labelPlacement: 'always-horizontal',
          useCodedValues: true,
          symbol: {
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
          },
          minScale: 9500,
          maxScale: 0
        }
      ]
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_PARKING,
    title: 'Gameday Parking',
    url: `${footballLotsUrl}/${GAMEDAY_PARKING_POINT_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.notes',
      description: 'attributes.notes_1'
    },
    // The gameday parking picture markers are pin-shaped (natural ~60x73, 0.82 ratio) but the service
    // renderer forces most of them into a 30x30 square, which stretches them wide on the map AND in the
    // legend swatch. Re-render both at a matching ~0.82 ratio (25x30). `EsriMapService` applies these
    // width/height hints to the on-map picture markers too (`applyLegendOverrideToLayerSymbols`), so a
    // single override de-stretches the icons and the legend swatches without re-embedding the images.
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
        // Entry routes: shown (with a vehicle filter) for the vehicle-based modes; direction adds Pre_Post.
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_ENTRY_ROUTES,
          conversions: [
            { input: TransportType.TWELFTH_MAN, expression: "Type = 'Vehicle'", propOverrides: SHOW },
            { input: TransportType.PERSONAL_VEHICLE, expression: "Type = 'Vehicle'", propOverrides: SHOW }
          ]
        },
        // Exit routes: filtered per mode; Pedestrian is fully self-contained (no direction step).
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
          conversions: [
            { input: TransportType.TWELFTH_MAN, expression: "Type = 'Vehicle'", propOverrides: SHOW },
            { input: TransportType.PERSONAL_VEHICLE, expression: "Type = 'Vehicle'", propOverrides: SHOW },
            { input: TransportType.MICROMOBILITY, expression: "Type = 'Cyclist'", propOverrides: SHOW },
            {
              input: TransportType.PEDESTRIAN,
              expression: "Type = 'Pedestrian' AND Pre_Post = 'Post-Game'",
              propOverrides: SHOW
            }
          ]
        },
        // Street / grass areas
        {
          layerId: FOOTBALL_PARKING_LAYERS.FP_STREET_GRASS_AREAS,
          conversions: [
            { input: TransportType.TWELFTH_MAN, propOverrides: SHOW },
            { input: TransportType.RV, propOverrides: SHOW },
            { input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }
          ]
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
          // 12th Man + Personal Vehicle use the shared lots layer (full color key via ignoreDefinitionExpression);
          // RV uses its own FP_RV_PARKING layer so its legend stays scoped to a single category.
          layerId: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
          conversions: [
            { input: TransportType.TWELFTH_MAN, expression: "type = 'Reserved Athletic'", propOverrides: SHOW },
            { input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }
          ]
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
          // Exit map: keep Exit Routes (adding the post-game clause), hide Entry Routes.
          layerId: FOOTBALL_PARKING_LAYERS.FP_EXIT_ROUTES,
          conversions: [
            { input: Direction.EXIT, expression: "Pre_Post = 'Post-Game'" },
            { input: Direction.ENTRY, propOverrides: HIDE }
          ]
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
