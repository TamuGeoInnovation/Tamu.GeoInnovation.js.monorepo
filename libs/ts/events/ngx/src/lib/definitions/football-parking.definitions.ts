import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

/**
 * Football gameday transportation map.
 *
 * Data comes from two services:
 *
 * 1. `TSFootball_Cache` (all transportation layers except the parking lots / gameday parking icons).
 * 2. `Hosted/Lots` (the parking-lot polygons + gameday parking point icons that Marcomm edits on game days).
 *
 * NOTE: `tsFootballCacheUrl` is pinned to the **dev** host until `TSFootball_Cache` is promoted to prod.
 * TODO: revert `tsFootballCacheUrl` to the prod host (`gis.tamu.edu`) once the cache is published there.
 */
const tsFootballCacheUrl = 'https://gis.dev.tamu.edu/arcgis/rest/services/TS/TSFootball_Cache/MapServer';
const footballLotsUrl = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Lots/FeatureServer';

/**
 * The `Hosted/Lots` FeatureServer exposes exactly two sublayers. The service listing is token-gated so the
 * 0 ↔ 1 assignment below is confirmed by rendering in-app.
 * TODO: verify which sublayer is the polygon lots vs the point gameday-parking icons and swap if needed.
 */
const LOTS_POLYGON_LAYER_INDEX = 0;
const GAMEDAY_PARKING_POINT_LAYER_INDEX = 1;

export enum FOOTBALL_PARKING_LAYERS {
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
  FP_GAMEDAY_PARKING = 'football-gameday-parking'
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
      listMode: 'hide'
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
      listMode: 'hide'
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
      listMode: 'hide'
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
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      // TODO: confirm the Hosted/Lots polygon schema exposes Name / TwelfthMan / Type; adjust if the fields differ.
      labelingInfo: [
        {
          // TwelfthMan lots (treat blank or single space as empty; anything else shows second line)
          labelExpressionInfo: {
            expression: '$feature.Name + TextFormatting.NewLine + $feature.TwelfthMan'
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
          where: "TwelfthMan IS NOT NULL AND TRIM(TwelfthMan) <> ''"
        },
        {
          // Non-TwelfthMan lots with a price embedded in Type (e.g. "Public $30")
          labelExpressionInfo: {
            expression:
              "var t=$feature.Type; var p=''; if(t!=null && t!='' && Find('$', t)>-1){ var i=Find('$', t); var seg=Mid(t,i,10); var sp=Find(' ', seg); if(sp>-1){ seg=Left(seg, sp);} var last=Right(seg,1); if(last=='-' || last==':' || last==',' ){ seg=Left(seg, Length(seg)-1);} p=seg; } $feature.Name + IIf(p=='','', ' - '+p);"
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
          where: "(TwelfthMan IS NULL OR TRIM(TwelfthMan) = '') AND Type IS NOT NULL AND Type LIKE '%$%' AND Type <> 'AVP'"
        },
        {
          // Fallback: non-priced, non-TwelfthMan
          labelExpression: '[Name]',
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
          where: "(TwelfthMan IS NULL OR TRIM(TwelfthMan) = '') AND (Type IS NULL OR Type NOT LIKE '%$%' OR Type = 'AVP')"
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
      name: 'attributes.LotName',
      description: 'attributes.Note'
    },
    native: {
      outFields: ['*'],
      visible: false,
      listMode: 'hide',
      definitionExpression: "Type = 'Charter'"
    }
  },
  {
    type: 'feature',
    id: FOOTBALL_PARKING_LAYERS.FP_GAMEDAY_PARKING,
    title: 'Gameday Parking',
    url: `${footballLotsUrl}/${GAMEDAY_PARKING_POINT_LAYER_INDEX}`,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: 'attributes.Notes'
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
  name: 'Football Map',
  applicationName: 'Football Transportation Map',
  shortApplicationName: 'Football Map',
  introductionText: 'Get the best transportation and parking information for game days.',
  // TODO: confirm the 2026 home schedule dates before release.
  eventDates: [
    '2025-08-30',
    '2025-09-06',
    '2025-09-27',
    '2025-10-04',
    '2025-10-11',
    '2025-11-15',
    '2025-11-22',
    '2025-12-20'
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
          layerId: FOOTBALL_PARKING_LAYERS.FP_PARKING_LOTS,
          conversions: [
            { input: TransportType.TWELFTH_MAN, expression: "Type = 'Reserved Athletic'", propOverrides: SHOW },
            { input: TransportType.RV, expression: "Type = 'RV'", propOverrides: SHOW },
            { input: TransportType.PERSONAL_VEHICLE, propOverrides: SHOW }
          ]
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
