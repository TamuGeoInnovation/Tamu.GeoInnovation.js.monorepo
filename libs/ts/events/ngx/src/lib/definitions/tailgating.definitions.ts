import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource, containsSearch } from '@tamu-gisc/ui-kits/ngx/search';
import { getDefaultGisHosts, commonLayerProps } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { FootballParkingConfiguration } from './football-parking.definitions';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

/**
 * The tailgating zones are a hosted feature layer in TAMU's ArcGIS Online organization, maintained
 * in ArcGIS Pro. Their colors, outlines and the circled zone numbers come from the service's own
 * drawing info, so styling is changed by republishing the layer, not here. Popups read the `name`
 * and `type` fields, so keep those field names when editing the data.
 *
 * The event service adds these in reverse order, and a layer added later draws above the ones before
 * it, so the first entry draws on top: the circled numbers, then the tents, then the zones.
 */
export enum TAILGATING_LAYERS {
  ZONE_NUMBERS = 'tailgating-zone-numbers',
  TENTS = 'tailgating-tents',
  SIMPSON_TENTS = 'tailgating-simpson-tents',
  AGGIE_PARK = 'tailgating-aggie-park',
  WEST_CAMPUS = 'tailgating-west-campus',
  CONSTRUCTION = 'tailgating-construction'
}

const TAILGATE_ZONES_URL =
  'https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/TAMU_Tailgate_Zones/FeatureServer';

/**
 * Sublayer indices in `TAILGATE_ZONES_URL`, which follow the layer order in the ArcGIS Pro map it is
 * published from. Reordering that map and overwriting the web layer moves them, so update these too.
 */
const TAILGATE_ZONES_LAYER_INDEX = {
  ZONE_NUMBERS: 0,
  TENTS: 1,
  SIMPSON_TENTS: 2,
  WEST_CAMPUS: 3,
  AGGIE_PARK: 4
} as const;

/**
 * The tent layers take their visible scale range from the service, so it is set in ArcGIS Pro: the
 * packed Aggie Park tents draw only once zoomed in, the scattered Simpson Drill Field tents always.
 * `commonLayerProps` fixes a range for every layer, so the tents leave its range out.
 */
const tentLayerProps: Partial<typeof commonLayerProps> = { ...commonLayerProps };
delete tentLayerProps.minScale;
delete tentLayerProps.maxScale;

const tentPopupData: LayerSource['popupData'] = {
  name: 'Tent {attributes.tent_id}',
  description: 'attributes.lawn'
};

/**
 * Transportation Services' live construction areas (the same source as the Construction map),
 * filtered to the projects that affect tailgating. Matched by project number rather than objectid,
 * which stays stable when Transportation Services edits a project. Add a number here to show
 * another project.
 */
const CONSTRUCTION_URL = `https://${
  getDefaultGisHosts().tsgisHost
}/arcgis/rest/services/Hosted/TSConstruction_Hosted/FeatureServer/0`;

const TAILGATING_CONSTRUCTION_PROJECTS = [
  '02-3420', // Aplin Center, north of the West Campus Garage
  '02-3434' // SUP 1 Expansion Project, by Lot 74
];

const constructionPopupData: NonNullable<LayerSource['popupData']> = {
  projectName: { field: 'name', collapsed: true },
  startDate: { field: 'startdate', collapsed: true, format: 'date' },
  endDate: { field: 'enddate', collapsed: true, format: 'date' },

  name: '{attributes.projectName}',
  description: `<strong>Start Date:</strong> {attributes.startDate}<br><strong>End Date:</strong> {attributes.endDate}`
};

const zonePopupData: LayerSource['popupData'] = {
  name: 'attributes.name',
  description: 'attributes.type'
};

export const TailgatingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TAILGATING_LAYERS.WEST_CAMPUS,
    title: 'West Campus Tailgating',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.WEST_CAMPUS}`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: zonePopupData,
    listMode: 'show',
    visible: true,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: TAILGATING_LAYERS.AGGIE_PARK,
    title: 'Aggie Park Tailgating',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.AGGIE_PARK}`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: zonePopupData,
    listMode: 'show',
    visible: true,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: TAILGATING_LAYERS.CONSTRUCTION,
    title: 'Construction',
    url: CONSTRUCTION_URL,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: constructionPopupData,
    // Lets later template strings read the aliased date fields resolved above them.
    popupDataResolutionStrategy: 'cumulative',
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*'],
      definitionExpression: `number IN (${TAILGATING_CONSTRUCTION_PROJECTS.map((n) => `'${n}'`).join(', ')})`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: TAILGATING_LAYERS.SIMPSON_TENTS,
    title: 'Simpson Drill Field Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.SIMPSON_TENTS}`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: tentPopupData,
    listMode: 'show',
    visible: true,
    native: {
      ...tentLayerProps
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: TAILGATING_LAYERS.TENTS,
    title: 'Aggie Park Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.TENTS}`,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: tentPopupData,
    listMode: 'show',
    visible: true,
    native: {
      ...tentLayerProps
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: TAILGATING_LAYERS.ZONE_NUMBERS,
    title: 'Zone Numbers',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.ZONE_NUMBERS}`,
    listMode: 'show',
    visible: true,
    native: {
      ...commonLayerProps,
      // The circles explain themselves; a legend entry for them would only repeat the Layers list.
      legendEnabled: false
    }
  } as unknown as LayerSource
];

/**
 * Readable links: `?zone=AP-7` and `?tent=O12`, which a popup's copy button also writes. Matched,
 * case-insensitively, on the `zone_ID` and `tent_id` fields set in ArcGIS Pro, so a link survives a
 * republish that renumbers object ids. A zone without a `zone_ID` keeps the generic `feature=` link.
 * Not searched themselves (`searchActive: false`): an exact match, for links. `TailgatingSearchSources`
 * below are what the sidebar search uses.
 */
const TailgatingLinkSources: SearchSource[] = [
  {
    source: 'tailgating-zone',
    name: 'Tailgating Zones',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.AGGIE_PARK}`,
    queryParams: { where: { keys: ['zone_ID'], operators: ['='] } },
    featuresLocation: 'features',
    displayTemplate: '{attributes.name}',
    searchActive: false,
    urlQueryParam: 'zone',
    urlQueryParamAliases: ['Zone']
  },
  {
    source: 'tailgating-tent',
    name: 'Tailgating Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.TENTS}`,
    queryParams: { where: { keys: ['tent_id'], operators: ['='] } },
    featuresLocation: 'features',
    displayTemplate: 'Tent {attributes.tent_id}',
    searchActive: false,
    urlQueryParam: 'tent',
    urlQueryParamAliases: ['Tent']
  }
] as SearchSource[];

/**
 * What the sidebar search finds on this map, alongside the usual buildings and parking
 * (`searchSourcesWithCampus`): tents by their id, and the named areas by name or zone id. A result
 * opens the map's own feature and popup, as a `?tent=` or `?zone=` link does: the feature of the layer
 * with the same `url`, by object id. A named area whose `name` is empty is still found by its `zone_ID`,
 * and lists by it until it is given a name.
 */
const TailgatingSearchSources: SearchSource[] = [
  {
    source: 'tailgating-tent-search',
    name: 'Aggie Park Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.TENTS}`,
    queryParams: containsSearch(['tent_id']),
    featuresLocation: 'features',
    displayTemplate: 'Tent {attributes.tent_id}',
    searchActive: true
  },
  {
    source: 'tailgating-simpson-tent-search',
    name: 'Simpson Drill Field Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.SIMPSON_TENTS}`,
    queryParams: containsSearch(['tent_id']),
    featuresLocation: 'features',
    displayTemplate: 'Tent {attributes.tent_id}',
    searchActive: true
  },
  {
    source: 'tailgating-aggie-park-area-search',
    name: 'Aggie Park Tailgating',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.AGGIE_PARK}`,
    queryParams: containsSearch(['name', 'zone_ID']),
    featuresLocation: 'features',
    displayTemplate: '{attributes.name|attributes.zone_ID}',
    searchActive: true
  },
  {
    source: 'tailgating-west-campus-area-search',
    name: 'West Campus Tailgating',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.WEST_CAMPUS}`,
    queryParams: containsSearch(['name', 'zone_ID']),
    featuresLocation: 'features',
    displayTemplate: '{attributes.name|attributes.zone_ID}',
    searchActive: true
  }
] as SearchSource[];

export const TailgatingConfiguration: EventConfiguration = {
  id: 'tailgating',
  // Sorts directly under "Football" in the alphabetical Athletics Events list.
  name: 'Football Tailgating',
  applicationName: 'Football Tailgating Map',
  shortApplicationName: 'Tailgating',
  introductionText: 'Tailgating zones at Aggie Park and West Campus for',
  // The football map's home game days, so the two maps' season-over state always agree (#1814).
  eventDates: FootballParkingConfiguration.eventDates,
  scheduleUrl: FootballParkingConfiguration.scheduleUrl,
  eventPassedWarning: {
    title: 'Football season is over',
    message: 'The tailgating zones shown are from the most recent football season.',
    followupMessage: 'Tailgate zones are subject to change before next season.'
  },
  mapCenter: [-96.3415, 30.6082],
  zoom: 16,
  referenceLayerListOrder: 'source',
  // Tents and zones are read against campus, so the map opens on the campus basemap whatever basemap
  // the visitor last chose elsewhere.
  basemap: 'campus-raster',
  searchSources: [...TailgatingLinkSources, ...TailgatingSearchSources],
  searchSourcesWithCampus: true,
  // Raised on the same game days as the Football toast, and second, because the map is registered
  // right after Football's (#1817).
  toast: {
    id: 'tailgating-notification',
    title: 'Football Tailgating Map Available',
    message: 'Tailgating on game day? Click me to open the Football Tailgating Map to find tailgating zones and tents.',
    imgUrl: './assets/images/icons/sports/Football.png',
    imgAltText: 'Football Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/tailgating'
    }
  }
};

export const TailgatingOptions: SpecialEventOptions = [];

export const TailgatingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TailgatingConfiguration,
  options: TailgatingOptions,
  sources: TailgatingColdLayerSources,
  references: TAILGATING_LAYERS,
  discover: {
    id: TailgatingConfiguration.id,
    name: TailgatingConfiguration.name,
    description: 'Tailgating zones at Aggie Park and West Campus on football game days.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: [
      'tailgating',
      'tailgate',
      'football',
      'gameday',
      'aggie park',
      'west campus',
      'reed arena',
      'ucen',
      'revel xp'
    ]
  }
};
