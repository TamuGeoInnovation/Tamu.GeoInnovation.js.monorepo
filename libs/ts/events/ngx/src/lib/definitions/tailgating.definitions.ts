import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { getDefaultGisHosts, commonLayerProps } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { FootballParkingConfiguration } from './football-parking.definitions';

import esri = __esri;

/**
 * The tailgating zones are a hosted feature layer in TAMU's ArcGIS Online organization, maintained
 * in ArcGIS Pro. Their colors, outlines and the circled zone numbers come from the service's own
 * drawing info, so styling is changed by republishing the layer, not here. Popups read the `name`
 * and `type` fields, so keep those field names when editing the data.
 *
 * This service has no production counterpart yet, so the map is development-only
 * (`DevelopmentOnlyEventDefinitions`) and the service is listed in the smoke suite's
 * `DEVELOPMENT_ONLY_SERVICES`, with this map's route (`/events/tailgating`) as the page that uses it.
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

/** Season-over state tracks the football map's home game dates, so both update together. */
const seasonDates = FootballParkingConfiguration.eventDates.map((date) =>
  // A bare 'YYYY-MM-DD' parses as UTC midnight, which is the evening before in College Station.
  // Treat each game day as lasting until 11:59 PM local time instead.
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T23:59:59` : date
);

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
    popupComponent: MarkdownPopupComponent,
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
    popupComponent: MarkdownPopupComponent,
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
    popupComponent: MarkdownPopupComponent,
    popupData: constructionPopupData,
    // Lets later template strings read the aliased date fields resolved above them.
    popupDataResolutionStrategy: 'cumulative',
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*'],
      definitionExpression: `number IN (${TAILGATING_CONSTRUCTION_PROJECTS.map((n) => `'${n}'`).join(', ')})`,
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: TAILGATING_LAYERS.SIMPSON_TENTS,
    title: 'Simpson Drill Field Tents',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.SIMPSON_TENTS}`,
    popupComponent: MarkdownPopupComponent,
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
    popupComponent: MarkdownPopupComponent,
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
 * case-insensitively, on the `zone_id` and `tent_id` fields set in ArcGIS Pro, so a link survives a
 * republish that renumbers object ids. A zone without a `zone_id` keeps the generic `feature=` link.
 * Not searchable from the sidebar (`searchActive: false`), which keeps the usual campus search.
 */
const TailgatingLinkSources: SearchSource[] = [
  {
    source: 'tailgating-zone',
    name: 'Tailgating Zones',
    url: `${TAILGATE_ZONES_URL}/${TAILGATE_ZONES_LAYER_INDEX.AGGIE_PARK}`,
    queryParams: { where: { keys: ['zone_id'], operators: ['='] } },
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

export const TailgatingConfiguration: EventConfiguration = {
  id: 'tailgating',
  // Sorts directly under "Football" in the alphabetical Athletics Events list.
  name: 'Football Tailgating',
  applicationName: 'Football Tailgating Map',
  shortApplicationName: 'Tailgating',
  introductionText: 'Tailgating zones at Aggie Park and West Campus for',
  eventDates: seasonDates,
  scheduleUrl: FootballParkingConfiguration.scheduleUrl,
  eventPassedWarning: {
    title: 'Football season is over',
    message: 'The tailgating zones shown are from the most recent football season.',
    followupMessage: 'Tailgate zones are subject to change before next season.'
  },
  mapCenter: [-96.3415, 30.6082],
  zoom: 16,
  referenceLayerListOrder: 'source',
  searchSources: TailgatingLinkSources
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
    // Prototype: registered on development hosts only (see `DevelopmentOnlyEventDefinitions`).
    labels: ['Beta'],
    keywords: ['tailgating', 'tailgate', 'football', 'gameday', 'aggie park', 'west campus', 'reed arena', 'ucen', 'revel xp']
  }
};
