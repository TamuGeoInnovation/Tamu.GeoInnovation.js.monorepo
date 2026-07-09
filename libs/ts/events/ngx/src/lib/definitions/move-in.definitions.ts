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
  RESIDENCE_HALL = 'Residence Hall',
  // Points of Interest is split into one feature layer per icon Type so each can be toggled
  // independently (grouped under a single parent in the layer list).
  POI_GROUP = 'Move-In Points of Interest',
  POI_KEYS = 'move-in-poi-keys',
  POI_INFO = 'move-in-poi-info',
  POI_DINING = 'move-in-poi-dining',
  POI_RECYCLE = 'move-in-poi-recycle',
  POI_BIKE = 'move-in-poi-bike',
  POI_NO_PARKING = 'move-in-poi-no-parking',
  // Streets are split so the No-Roadside-Parking closures can be toggled off independently of the
  // drop-off zones (grouped under a single parent in the layer list).
  STREETS_GROUP = 'Move-In Streets',
  STREETS_DROPOFF = 'move-in-streets-dropoff',
  STREETS_CLOSURES = 'move-in-streets-closures',
  // Lots are split into available parking, accessible parking, and closures so each can be
  // defaulted and toggled independently (grouped under a single parent in the layer list).
  LOTS_GROUP = 'Move-In Lots',
  LOTS_AVAILABLE = 'move-in-lots-available',
  LOTS_ACCESSIBLE = 'move-in-lots-accessible',
  LOTS_CLOSURES = 'move-in-lots-closures'
}

const moveInServiceUrl = Connections.moveInParkingUrl;
const basemapServiceUrl = Connections.basemapUrl;

const poiUrl = `${moveInServiceUrl}/0`;
const streetsUrl = `${moveInServiceUrl}/1`;
const lotsUrl = `${moveInServiceUrl}/2`;

type CampusArea = 'Northside' | 'Southside' | 'White Creek';

// Builder group headings shown for each residence-hall campus area.
const AREA_GROUP_LABEL: Record<CampusArea, string> = {
  Northside: 'North Side',
  Southside: 'South Side',
  'White Creek': 'White Creek'
};

// Per-area framing applied once a hall in that area is selected (Issue 2). Centers are the centroids
// of each CampusArea's parking footprint on the published service; tune center/zoom here to adjust.
// Zoom 17 frames a whole area (~900 m) with margin — the tightest level that still fits an area, so
// the selected (flashed) hall is always on-screen.
const AREA_VIEW: Record<CampusArea, { center: [number, number]; zoom: number }> = {
  Northside: { center: [-96.34318, 30.61689], zoom: 17 },
  Southside: { center: [-96.33614, 30.61445], zoom: 17 },
  'White Creek': { center: [-96.35424, 30.60824], zoom: 17 }
};

const markdownPopup = {
  popupComponent: MarkdownPopupComponent
};

const poiPopup = {
  ...markdownPopup,
  popupData: {
    name: '{attributes.Type}',
    description: { field: 'Note' }
  }
};

const streetPopup = {
  ...markdownPopup,
  popupData: {
    name: { field: 'Name' },
    description: { field: 'note' }
  }
};

const lotPopup = {
  ...markdownPopup,
  popupData: {
    name: { field: 'LotName' },
    description: { field: 'note' }
  }
};

// Several POI icons are pin-shaped (natural 32x40, ~0.8 ratio) but the published renderer forces a
// few of them into a square (Bike/Keys 25x25, No-Roadside-Parking 20x20), which stretches them.
// Re-render those at a matching 0.8 ratio (24x30) to remove the distortion. The same hints are
// applied to both the legend swatch and the on-map symbol by the map service.
const pinAspectRatioLegend = {
  mode: 'renderer-symbol' as const,
  preserveAspectRatio: true,
  fit: 'contain' as const,
  width: 24,
  height: 30
};

/**
 * Builds one Points-of-Interest icon layer filtered to a single `Type`. The base `Type` filter
 * lives on `native.definitionExpression` (not the top level) because these layers are group
 * children: the EventService merges any area-isolation effect onto the native expression, whereas
 * `generateLayer` would otherwise let `native` override a top-level expression.
 *
 * `fixAspectRatio` opts the layer into the pin de-stretch sizing above.
 */
function poiIconLayer(
  id: MOVE_IN_LAYERS,
  type: string,
  title: string,
  visible: boolean,
  fixAspectRatio = false
): LayerSource {
  return {
    type: 'feature',
    id,
    title,
    url: poiUrl,
    visible,
    listMode: 'show',
    ...poiPopup,
    ...(fixAspectRatio ? { legend: pinAspectRatioLegend } : {}),
    native: {
      outFields: ['*'],
      definitionExpression: `Type = '${type}'`
    }
  };
}

/**
 * Builds one Lots or Streets layer for the provided base `Type` filter. Like the POI icon layers,
 * the base filter lives on `native.definitionExpression` so the date and area effects can be
 * appended to it.
 */
function filteredLayer(
  id: MOVE_IN_LAYERS,
  url: string,
  popup: typeof lotPopup,
  definitionExpression: string,
  title: string,
  visible: boolean
): LayerSource {
  return {
    type: 'feature',
    id,
    title,
    url,
    visible,
    listMode: 'show',
    ...popup,
    native: {
      outFields: ['*'],
      definitionExpression
    }
  };
}

const lotLayer = (id: MOVE_IN_LAYERS, definitionExpression: string, title: string, visible: boolean): LayerSource =>
  filteredLayer(id, lotsUrl, lotPopup, definitionExpression, title, visible);

const streetLayer = (id: MOVE_IN_LAYERS, definitionExpression: string, title: string, visible: boolean): LayerSource =>
  filteredLayer(id, streetsUrl, streetPopup, definitionExpression, title, visible);

export const MoveInColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MOVE_IN_LAYERS.RESIDENCE_HALL,
    title: 'Residence Hall',
    url: `${basemapServiceUrl}/1`,
    visible: true,
    listMode: 'show',
    // No base definition expression: the selected-hall effect sets it directly. Keeping it off
    // `native` avoids `generateLayer`'s native-overrides-top-level behavior so the effect applies.
    native: {
      outFields: ['*'],
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
    type: 'group',
    id: MOVE_IN_LAYERS.POI_GROUP,
    title: 'Points of Interest',
    visible: true,
    listMode: 'show',
    // All POI icons are off by default — the user opts into whichever they want. Bike, Keys, and
    // No-Roadside-Parking are de-stretched (see `pinAspectRatioLegend`).
    sources: [
      poiIconLayer(MOVE_IN_LAYERS.POI_KEYS, 'Keys', 'Check-In / Key Pickup', false, true),
      poiIconLayer(MOVE_IN_LAYERS.POI_INFO, 'Info', 'Information', false),
      poiIconLayer(MOVE_IN_LAYERS.POI_DINING, 'Dining', 'Dining', false),
      poiIconLayer(MOVE_IN_LAYERS.POI_RECYCLE, 'Recycle', 'Cardboard Recycling', false),
      poiIconLayer(MOVE_IN_LAYERS.POI_BIKE, 'Bike', 'Bike Registration', false, true),
      poiIconLayer(MOVE_IN_LAYERS.POI_NO_PARKING, 'NoParking', 'No Roadside Parking', false, true)
    ]
  },
  {
    type: 'group',
    id: MOVE_IN_LAYERS.STREETS_GROUP,
    title: 'Move-In Streets',
    visible: true,
    listMode: 'show',
    sources: [
      streetLayer(MOVE_IN_LAYERS.STREETS_DROPOFF, `Type IN ('LZAllWeek', 'LZSundayOnly')`, 'Drop-Off Zones', true),
      // Street closures: off by default (matches the lot closures), still independently toggleable.
      streetLayer(MOVE_IN_LAYERS.STREETS_CLOSURES, `Type = 'LZNoParking'`, 'No Roadside Parking', false)
    ]
  },
  {
    type: 'group',
    id: MOVE_IN_LAYERS.LOTS_GROUP,
    title: 'Parking Lots',
    visible: true,
    listMode: 'show',
    sources: [
      lotLayer(MOVE_IN_LAYERS.LOTS_AVAILABLE, `Type NOT IN ('NoParking', 'Disabled')`, 'Available Lots', true),
      // Accessible parking: hidden until the accessible-parking step opts in (Issues 5 & 6).
      lotLayer(MOVE_IN_LAYERS.LOTS_ACCESSIBLE, `Type = 'Disabled'`, 'Accessible Parking', false),
      // Lot closures: off by default (Issue 3), still independently toggleable.
      lotLayer(MOVE_IN_LAYERS.LOTS_CLOSURES, `Type = 'NoParking'`, 'Lot Closures', false)
    ]
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
  builderStartStep: 'accommodations',
  // Flash the selected residence hall once the map loads so users can spot its location (Issue 7).
  flashLayerId: MOVE_IN_LAYERS.RESIDENCE_HALL
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

interface HallDefinition {
  value: MoveInHallChoices;
  label: string;
  area: CampusArea;
  buildings: string[];
}

// Single source of truth for residence halls: drives the builder choices, the residence-hall
// building filter, and the campus-area isolation filter applied to every move-in layer.
const MOVE_IN_HALLS: HallDefinition[] = [
  { value: MoveInHallChoices.CLEMENTS, label: 'Clements Hall', area: 'Northside', buildings: ['0548'] },
  { value: MoveInHallChoices.DAVIS_GARY, label: 'Davis-Gary Hall', area: 'Northside', buildings: ['0415'] },
  { value: MoveInHallChoices.FOWLER, label: 'Fowler Hall', area: 'Northside', buildings: ['0427'] },
  { value: MoveInHallChoices.HAAS, label: 'Haas Hall', area: 'Northside', buildings: ['0549'] },
  { value: MoveInHallChoices.HOBBY, label: 'Hobby Hall', area: 'Northside', buildings: ['0653'] },
  { value: MoveInHallChoices.HUGHES, label: 'Hughes Hall', area: 'Northside', buildings: ['0426'] },
  { value: MoveInHallChoices.HULLABALOO, label: 'Hullabaloo Hall', area: 'Northside', buildings: ['1416'] },
  { value: MoveInHallChoices.KEATHLEY, label: 'Keathley Hall', area: 'Northside', buildings: ['0428'] },
  { value: MoveInHallChoices.LECHNER, label: 'Lechner Hall', area: 'Northside', buildings: ['0294'] },
  { value: MoveInHallChoices.LEGGETT, label: 'Legett Hall', area: 'Northside', buildings: ['0419'] },
  { value: MoveInHallChoices.MCFADDEN, label: 'McFadden Hall', area: 'Northside', buildings: ['0550'] },
  { value: MoveInHallChoices.MOSES, label: 'Moses Hall', area: 'Northside', buildings: ['0412'] },
  { value: MoveInHallChoices.NEELEY, label: 'Neeley Hall', area: 'Northside', buildings: ['0652'] },
  { value: MoveInHallChoices.SCHUHMACHER, label: 'Schuhmacher Hall', area: 'Northside', buildings: ['0430'] },
  { value: MoveInHallChoices.WALTON, label: 'Walton Hall', area: 'Northside', buildings: ['0422'] },
  { value: MoveInHallChoices.APPELT, label: 'Appelt Hall', area: 'Southside', buildings: ['0293'] },
  { value: MoveInHallChoices.ASTON, label: 'Aston Hall', area: 'Southside', buildings: ['0447'] },
  { value: MoveInHallChoices.DUNN, label: 'Dunn Hall', area: 'Southside', buildings: ['0442'] },
  { value: MoveInHallChoices.EPPRIGHT, label: 'Eppright Hall', area: 'Southside', buildings: ['0292'] },
  { value: MoveInHallChoices.HART, label: 'Hart Hall', area: 'Southside', buildings: ['0417'] },
  { value: MoveInHallChoices.KRUEGER, label: 'Krueger Hall', area: 'Southside', buildings: ['0441'] },
  { value: MoveInHallChoices.MOSHER, label: 'Mosher Hall', area: 'Southside', buildings: ['0433'] },
  { value: MoveInHallChoices.RUDDER, label: 'Rudder Hall', area: 'Southside', buildings: ['0291'] },
  { value: MoveInHallChoices.UNDERWOOD, label: 'Underwood Hall', area: 'Southside', buildings: ['0394'] },
  { value: MoveInHallChoices.WELLS, label: 'Wells Hall', area: 'Southside', buildings: ['0290'] },
  {
    value: MoveInHallChoices.WHITE_CREEK,
    label: 'White Creek Apartments',
    area: 'White Creek',
    buildings: ['1590', '1591', '1592']
  }
];

// Layers isolated to the selected hall's campus area (Issue 2). The same area filter is appended to
// every move-in display layer so only that section of campus is shown.
const AREA_ISOLATED_LAYER_IDS: MOVE_IN_LAYERS[] = [
  MOVE_IN_LAYERS.POI_KEYS,
  MOVE_IN_LAYERS.POI_INFO,
  MOVE_IN_LAYERS.POI_DINING,
  MOVE_IN_LAYERS.POI_RECYCLE,
  MOVE_IN_LAYERS.POI_BIKE,
  MOVE_IN_LAYERS.POI_NO_PARKING,
  MOVE_IN_LAYERS.STREETS_DROPOFF,
  MOVE_IN_LAYERS.STREETS_CLOSURES,
  MOVE_IN_LAYERS.LOTS_AVAILABLE,
  MOVE_IN_LAYERS.LOTS_ACCESSIBLE,
  MOVE_IN_LAYERS.LOTS_CLOSURES
];

// Layers whose visible features depend on the selected move-in day (Issue 1). POI are intentionally
// excluded — they are not date-bound and stay on regardless of the selected day.
const DATE_FILTERED_LAYER_IDS: MOVE_IN_LAYERS[] = [
  MOVE_IN_LAYERS.STREETS_DROPOFF,
  MOVE_IN_LAYERS.STREETS_CLOSURES,
  MOVE_IN_LAYERS.LOTS_AVAILABLE,
  MOVE_IN_LAYERS.LOTS_ACCESSIBLE,
  MOVE_IN_LAYERS.LOTS_CLOSURES
];

// Show a street/lot arrangement when the selected day falls within its [StartDate, EndDate] window.
// The service stores each window at day granularity, so a date-only comparison is exact.
const dateConversions = Object.values(MoveInDateChoices).map((date) => ({
  input: date,
  expression: `StartDate <= DATE '${date}' AND EndDate >= DATE '${date}'`,
  deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_AND
}));

// Append the selected hall's campus area to each layer's existing filter. Campus-wide features tagged
// with no area (general Free/Paid visitor lots, a few loading zones) carry a NULL CampusArea and are
// kept visible in every area so those options never vanish during isolation.
const areaIsolationConversions = MOVE_IN_HALLS.map((hall) => ({
  input: hall.value,
  expression: `(CampusArea = '${hall.area}' OR CampusArea IS NULL)`,
  deconflictingStrategy: ConversionDeconflictingStrategy.APPEND_AND
}));

// Filter the residence-hall layer to the selected hall's building(s). The basemap building-number
// field is `Number` (unpadded, present on both the prod and dev GIS hosts); the host-specific
// `BldgNum`/`Bldg_Number` fields are avoided so this works regardless of which host the basemap
// resolves to.
const hallBuildingConversions = MOVE_IN_HALLS.map((hall) => ({
  input: hall.value,
  expression: `Number IN (${hall.buildings.map((building) => `'${building}'`).join(', ')})`
}));

export const MoveInOptions: SpecialEventOptions = [
  {
    value: MoveInBuilderOptions.MOVE_IN_DATE,
    label: 'Move-In Date',
    shortDescription: 'Move-In Date',
    description: 'Select your move-in day.',
    uiType: 'date-card-grid',
    choices: [
      { value: MoveInDateChoices.AUG_19_2026, label: 'August 19, 2026' },
      { value: MoveInDateChoices.AUG_20_2026, label: 'August 20, 2026' },
      { value: MoveInDateChoices.AUG_21_2026, label: 'August 21, 2026' },
      { value: MoveInDateChoices.AUG_22_2026, label: 'August 22, 2026' },
      { value: MoveInDateChoices.AUG_23_2026, label: 'August 23, 2026' },
      { value: MoveInDateChoices.AUG_24_2026, label: 'August 24, 2026' }
    ],
    effects: {
      layers: DATE_FILTERED_LAYER_IDS.map((layerId) => ({ layerId, conversions: dateConversions }))
    }
  },
  {
    value: MoveInBuilderOptions.RESIDENCE_HALL,
    label: 'Residence Hall',
    shortDescription: 'Residence Hall',
    description: 'Select your residence hall.',
    uiType: 'grouped-card-grid',
    choices: MOVE_IN_HALLS.map((hall) => ({
      value: hall.value,
      label: hall.label,
      group: AREA_GROUP_LABEL[hall.area],
      mapView: AREA_VIEW[hall.area]
    })),
    effects: {
      layers: [
        { layerId: MOVE_IN_LAYERS.RESIDENCE_HALL, conversions: hallBuildingConversions },
        ...AREA_ISOLATED_LAYER_IDS.map((layerId) => ({ layerId, conversions: areaIsolationConversions }))
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
      { value: MoveInAccessibleChoices.NO, label: 'No, I do not need accessible parking' },
      { value: MoveInAccessibleChoices.YES, label: 'Yes, I do require accessible parking' }
    ],
    effects: {
      layers: [
        {
          // Accessible parking shows only when the user opts in (Issue 6).
          layerId: MOVE_IN_LAYERS.LOTS_ACCESSIBLE,
          conversions: [
            { input: MoveInAccessibleChoices.YES, propOverrides: { visible: true } },
            { input: MoveInAccessibleChoices.NO, propOverrides: { visible: false } }
          ]
        }
      ]
    }
  }
];

// Top-level layer references in draw order: the first entry renders on top (the EventService draws
// the reversed list bottom-to-top). Points of Interest sit above the residence hall, which sits
// above the street and lot polygons.
const MoveInLayerReferences: Record<string, string> = {
  POINTS_OF_INTEREST: MOVE_IN_LAYERS.POI_GROUP,
  RESIDENCE_HALL: MOVE_IN_LAYERS.RESIDENCE_HALL,
  MOVE_IN_STREETS: MOVE_IN_LAYERS.STREETS_GROUP,
  PARKING_LOTS: MOVE_IN_LAYERS.LOTS_GROUP
};

export const MoveInTs: AggiemapCustomMapConfiguration = {
  configuration: MoveInConfiguration,
  options: MoveInOptions,
  sources: MoveInColdLayerSources,
  references: MoveInLayerReferences,
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
