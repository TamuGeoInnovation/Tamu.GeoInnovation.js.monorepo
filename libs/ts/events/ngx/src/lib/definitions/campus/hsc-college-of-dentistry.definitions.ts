import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { SearchSource, containsSearch } from '@tamu-gisc/ui-kits/ngx/search';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { EventPopups } from '../../modules/popups/popups';

/**
 * Layer ids used by the two HSC Dallas satellite-campus maps. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HSC_COLLEGE_OF_DENTISTRY_LAYERS {
  BASEMAP = 'hsc-college-of-dentistry-basemap-layer',
  PROPERTY = 'hsc-college-of-dentistry-property-layer'
}


/**
 * The HSC College of Dentistry, from the published `Hosted/HSCD` service (#2476).
 *
 * That service holds six buildings in two places about 4 km apart, under a basemap whose extent is about
 * 60 km wide. **Only the north-western site is a map for now** - the five buildings round the College of
 * Dentistry - which is what the GIS team asked for on 27 October: the south-eastern one, Dr. M.C. Cooper
 * Dental Clinic, comes later as its own map from this same service.
 *
 * So the map is told apart from the rest of the service by what it shows of the `/4 Structures` layer: it
 * opens on its own site and searches only its own buildings, and the basemap draws the whole published
 * area underneath, which is expected.
 *
 * The split is on `zip` rather than on building numbers: the postcode is what actually distinguishes the
 * two sites, and it stays true when a building is added to either.
 *
 * The maps' display names are not settled between "Medicine" and "Dentistry" (every northwest building
 * is the College of Dentistry; the southeast one is a dental clinic). Each is written once, here, and
 * every other name on the map is built from it.
 */
const NAME = 'HSC College of Dentistry';

interface DentistrySite {
  id: string;
  name: string;
  zip: string;
  layers: { BASEMAP: string; PROPERTY: string };
  center: [number, number];
  zoom: number;
  thumbnail: string;
}

const STRUCTURES_URL = `${Connections.hscDallasFeatureServerUrl}/4`;

function layerSources(site: DentistrySite): LayerSource[] {
  return [
    {
      type: 'vector-tile',
      id: site.layers.BASEMAP,
      title: `${site.name} Basemap`,
      url: Connections.hscDallasBasemapUrl,
      listMode: 'hide',
      visible: true,
      essential: true
    },
    {
      type: 'feature',
      id: site.layers.PROPERTY,
      title: 'Property',
      url: STRUCTURES_URL,
      popupComponent: EventPopups.CampusBuildingPopupComponent,
      listMode: 'hide',
      visible: true,
      essential: true,
      native: { ...campusClickOverlayNative, definitionExpression: `zip = '${site.zip}'` }
    }
  ];
}

/**
 * Property search source for one HSC Dallas site, backed by the `FeatureServer` companion to the vector-tile
 * basemap (layer `4`, "Structures" - plural, and not the index the other campuses use). Its fields are the
 * same as Houston Space Institute's, so the search is too; `fixedWhere` keeps a search to this site.
 */
function searchSources(site: DentistrySite): SearchSource[] {
  return [
    {
      source: `${site.id}-property`,
      // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
      // reads these same two names, so one declaration decides what a shared link says and what
      // `EventService.selectFeatureByConfiguredParam` accepts when it is opened - and that reads the
      // overlay above, which is already limited to this site.
      urlQueryParam: 'bldg',
      urlQueryParamAliases: ['abbrv'],
      name: 'Property',
      url: STRUCTURES_URL,
      queryParams: {
        ...containsSearch(['bldgname', 'bldgabbr', 'number']),
        scoringWhere: {
          keys: ['bldgname', 'bldgabbr'],
          operators: ['LIKE', 'LIKE'],
          wildcards: ['startsWith', 'startsWith'],
          transformations: ['UPPER', 'UPPER']
        },
        fixedWhere: `zip = '${site.zip}'`
      },
      scoringKeys: ['attributes.bldgabbr', 'attributes.number', 'attributes.bldgname'],
      featuresLocation: 'features',
      displayTemplate: '{attributes.bldgname} ({attributes.number})',
      popupComponent: EventPopups.CampusBuildingPopupComponent,
      searchActive: true
    }
  ];
}

function configuration(site: DentistrySite, search: SearchSource[]): EventConfiguration {
  return {
    id: site.id,
    name: site.name,
    applicationName: `Aggie Map â€” ${site.name}`,
    shortApplicationName: site.name,
    introductionText: `Map of the Texas A&M University ${site.name} campus.`,
    eventDates: [],
    mapCenter: site.center,
    zoom: site.zoom,
    hideLayerToggle: true,
    sidebarTabs: ['features'],
    buildingPopup: {
      layerId: site.layers.PROPERTY,
      title: ['bldgname', 'bldgabbr'],
      number: 'number',
      abbreviation: 'bldgabbr',
      address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
    },
    searchSources: search
  };
}

function definition(site: DentistrySite, sources: LayerSource[], search: SearchSource[]): AggiemapCustomMapConfiguration {
  const options: SpecialEventOptions = [];
  const config = configuration(site, search);

  return {
    configuration: config,
    options,
    sources,
    references: site.layers,
    type: 'general-map',
    discover: {
      id: config.id,
      name: config.name,
      description: config.introductionText,
      source: 'internal',
      type: 'satellite-campus',
      mapType: 'satellite-campus',
      // Listed on production as well as development (#2473): every satellite campus is live. The general
      // map search still excludes them all on both environments (#1482), which is deliberate.
      thumbnail: site.thumbnail
    }
  };
}

const COLLEGE_OF_DENTISTRY: DentistrySite = {
  id: 'hsc-college-of-dentistry',
  name: NAME,
  zip: '75246',
  layers: HSC_COLLEGE_OF_DENTISTRY_LAYERS,
  // The middle of the five buildings round the College of Dentistry. They span about 600 m, so at 17 all five are in frame
  // with the map's sidebar open; at 16 they are a cluster of small shapes in the lower right.
  center: [-96.78215, 32.789],
  zoom: 17,
  thumbnail: './assets/images/campus/hsc-college-of-dentistry.jpg'
};


export const HscCollegeOfDentistryLayerSources: LayerSource[] = layerSources(COLLEGE_OF_DENTISTRY);

export const HscCollegeOfDentistrySearchSources: SearchSource[] = searchSources(COLLEGE_OF_DENTISTRY);

export const HscCollegeOfDentistryTs: AggiemapCustomMapConfiguration = definition(
  COLLEGE_OF_DENTISTRY,
  HscCollegeOfDentistryLayerSources,
  HscCollegeOfDentistrySearchSources
);
