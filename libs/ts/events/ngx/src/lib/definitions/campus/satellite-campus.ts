import { LayerSource } from '@tamu-gisc/common/types';
import { CONSTRUCTION_HATCH_RENDERER } from '@tamu-gisc/maps/esri';
import { SearchSource, containsSearch } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration } from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { EventPopups } from '../../modules/popups/popups';

/**
 * One satellite campus map (#2600): what differs between campuses. Everything else is the same for all of them and is
 * written once, in {@link satelliteCampus}.
 */
export interface SatelliteCampus {
  /** The map's id, its address and its thumbnail's name: `hsc-kingsville`. */
  id: string;
  name: string;
  /** The window's title. `Aggie Map - <name>` unless the campus has its own. */
  applicationName?: string;
  introductionText: string;
  /** The Discover card's text, where it is not the introduction's. */
  description?: string;
  center: [number, number];
  zoom: number;

  /** The campus's layer ids, as its enum declares them. The map adds them in reverse, so the first draws on top. */
  layers: Record<string, string>;
  basemap: { id: string; url: string };

  /**
   * The clickable buildings: the near-invisible overlay that makes a click open a popup (vector tiles cannot be
   * queried), and the search over the same layer.
   *
   * **Its field names come from the service, not from another campus.** Most campuses' layers call them `bldgname`,
   * `bldgabbr` and `number`, but McAllen's are `name` and `abbrev` and Galveston's abbreviation is `bldgabbrev`. A
   * default here would make those campuses search nothing, which no test would notice, so there is none.
   */
  buildings: {
    id: string;
    url: string;
    /** What the layer and its search are called: "Property" (the layer "Property"), or "Building" (the layer "Buildings"). */
    kind: 'property' | 'building';
    fields: { name: string; abbreviation: string; number: string };
    /** The popup's title fields, first found first. The name and the abbreviation, unless the layer has more. */
    popupTitle?: string[];
    /** The state for the popup's address, or null for a layer with no address fields. */
    state: string | null;
    /** Only the buildings with this postcode, for a service that holds more than one campus. */
    zip?: string;
  };

  /** Construction drawn over the tiles in an orange grid (#2532), with the basemap's own construction styles hidden. */
  construction?: { id: string; url: string; hiddenStyleLayers: string[] };
}

/** A campus map, whose configuration and layers are always there, so a campus file can export them as they are. */
export type SatelliteCampusMap = AggiemapCustomMapConfiguration & {
  configuration: EventConfiguration;
  sources: LayerSource[];
};

const KIND = {
  property: { layer: 'Property', search: 'Property' },
  building: { layer: 'Buildings', search: 'Building' }
};

/**
 * A satellite campus map from what makes it that campus (#2600). The ten were ten copies of one definition, which had
 * already drifted in their comments; their differences are now the arguments, and the rest cannot drift.
 */
export function satelliteCampus(campus: SatelliteCampus): SatelliteCampusMap {
  const { buildings } = campus;
  const { fields } = buildings;
  const zipWhere = buildings.zip ? `zip = '${buildings.zip}'` : undefined;

  const sources: LayerSource[] = [
    // First, so it draws on top of the tiles. Not essential: essential layers are made at start-up in no fixed order.
    ...(campus.construction
      ? [
          {
            type: 'feature' as const,
            id: campus.construction.id,
            title: 'Construction',
            url: campus.construction.url,
            listMode: 'hide' as const,
            visible: true,
            native: {
              popupEnabled: false,
              labelsVisible: false,
              legendEnabled: false,
              renderer: CONSTRUCTION_HATCH_RENDERER
            }
          }
        ]
      : []),
    {
      type: 'vector-tile',
      id: campus.basemap.id,
      title: `${campus.name} Basemap`,
      url: campus.basemap.url,
      listMode: 'hide',
      visible: true,
      essential: true,
      ...(campus.construction ? { hiddenStyleLayers: campus.construction.hiddenStyleLayers } : {})
    },
    {
      type: 'feature',
      id: buildings.id,
      title: KIND[buildings.kind].layer,
      url: buildings.url,
      popupComponent: EventPopups.CampusBuildingPopupComponent,
      listMode: 'hide',
      visible: true,
      essential: true,
      native: zipWhere ? { ...campusClickOverlayNative, definitionExpression: zipWhere } : campusClickOverlayNative
    }
  ];

  const searchSources: SearchSource[] = [
    {
      source: `${campus.id}-${buildings.kind}`,
      // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link reads these same two
      // names, so one declaration decides what a shared link says and what `EventService.selectFeatureByConfiguredParam`
      // accepts when it is opened.
      urlQueryParam: 'bldg',
      urlQueryParamAliases: ['abbrv'],
      name: KIND[buildings.kind].search,
      url: buildings.url,
      queryParams: {
        ...containsSearch([fields.name, fields.abbreviation, fields.number]),
        scoringWhere: {
          keys: [fields.name, fields.abbreviation],
          operators: ['LIKE', 'LIKE'],
          wildcards: ['startsWith', 'startsWith'],
          transformations: ['UPPER', 'UPPER']
        },
        ...(zipWhere ? { fixedWhere: zipWhere } : {})
      },
      scoringKeys: [`attributes.${fields.abbreviation}`, `attributes.${fields.number}`, `attributes.${fields.name}`],
      featuresLocation: 'features',
      displayTemplate: `{attributes.${fields.name}} ({attributes.${fields.number}})`,
      popupComponent: EventPopups.CampusBuildingPopupComponent,
      searchActive: true
    }
  ];

  return {
    configuration: {
      id: campus.id,
      name: campus.name,
      applicationName: campus.applicationName ?? `Aggie Map - ${campus.name}`,
      shortApplicationName: campus.name,
      introductionText: campus.introductionText,
      eventDates: [],
      mapCenter: campus.center,
      zoom: campus.zoom,
      hideLayerToggle: true,
      sidebarTabs: ['features'],
      buildingPopup: {
        layerId: buildings.id,
        title: buildings.popupTitle ?? [fields.name, fields.abbreviation],
        number: fields.number,
        abbreviation: fields.abbreviation,
        ...(buildings.state ? { address: { street: 'address', city: 'city', zip: 'zip', state: buildings.state } } : {})
      },
      searchSources
    },
    options: [],
    sources,
    references: campus.layers,
    type: 'general-map',
    discover: {
      id: campus.id,
      name: campus.name,
      description: campus.description ?? campus.introductionText,
      source: 'internal',
      type: 'satellite-campus',
      mapType: 'satellite-campus',
      // Listed on production as well as development (#2473): every satellite campus is live. The general map search
      // still excludes them all on both environments (#1482), which is deliberate.
      thumbnail: `./assets/images/campus/${campus.id}.jpg`
    }
  };
}
