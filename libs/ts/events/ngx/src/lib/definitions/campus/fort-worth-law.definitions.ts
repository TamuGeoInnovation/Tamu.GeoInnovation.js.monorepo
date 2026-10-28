import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { CONSTRUCTION_HATCH_RENDERER } from '@tamu-gisc/maps/esri';
import { SearchSource, containsSearch } from '@tamu-gisc/ui-kits/ngx/search';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { EventPopups } from '../../modules/popups/popups';

/**
 * Layer ids used by the Fort Worth Law School satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum FORT_WORTH_LAW_LAYERS {
  BASEMAP = 'fort-worth-law-basemap-layer',
  CONSTRUCTION = 'fort-worth-law-construction-layer',
  PROPERTY = 'fort-worth-law-property-layer'
}

export const FortWorthLawLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: FORT_WORTH_LAW_LAYERS.BASEMAP,
    title: 'Fort Worth Law School Basemap',
    url: Connections.fortWorthLawBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true,
    // At the bottom of the map's layers, whenever it finishes loading, so the construction is drawn over it. Layers
    // are added as each is made, so without this the tiles could land on top (#2532).
    layerIndex: 0,
    // The tiles' construction fill (`/1`, a sprite pattern the packager rasterized onto an opaque tile, pink on
    // production) and its outline (`/0`) are hidden; the layer above draws both instead (#2532).
    hiddenStyleLayers: ['Construction/1', 'Construction/0']
  },
  // The construction, drawn over the tiles as every campus draws it: an orange grid with our own black outline
  // (#2532). It lands above the tiles because they are pinned to the bottom.
  {
    type: 'feature',
    id: FORT_WORTH_LAW_LAYERS.CONSTRUCTION,
    title: 'Construction',
    url: `${Connections.fortWorthLawFeatureServerUrl}/1`,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: {
      popupEnabled: false,
      renderer: CONSTRUCTION_HATCH_RENDERER
    }
  },
  {
    type: 'feature',
    id: FORT_WORTH_LAW_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.fortWorthLawFeatureServerUrl}/0`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the Fort Worth Law School campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (layer `0`, "Law School Buildings").
 *
 * The layer carries the same building fields as the other satellite campuses - `bldgname`, `bldgabbr`,
 * `number`, `address`, `city`, `zip` - so the search and popup are declared the same way they are there.
 */
export const FortWorthLawSearchSources: SearchSource[] = [
  {
    source: 'fort-worth-law-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.fortWorthLawFeatureServerUrl}/0`,
    queryParams: {
      ...containsSearch(['bldgname', 'bldgabbr', 'number']),
      scoringWhere: {
        keys: ['bldgname', 'bldgabbr'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    scoringKeys: ['attributes.bldgabbr', 'attributes.number', 'attributes.bldgname'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.bldgname} ({attributes.number})',
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    searchActive: true
  }
];

export const FortWorthLawConfiguration: EventConfiguration = {
  id: 'fort-worth-law',
  name: 'Fort Worth Law School',
  applicationName: 'Aggie Map - Fort Worth Law School',
  shortApplicationName: 'Fort Worth Law School',
  introductionText: 'Map of the Texas A&M University School of Law campus in Fort Worth.',
  eventDates: [],
  // Centred on the three TAMU buildings - the Law School (LAWS), the Law & Education building (FWLE)
  // and Research & Innovation A (RIB-A) - which sit together around 3800-3901 on the east side.
  //
  // Deliberately NOT the layer's published extent centre, which is about a kilometre north-west of
  // them: the layer's fourth feature is "Tarrant County" (DS04) at -97.3353, 32.7551, and it stretches
  // the extent across 1310 m. A map opened on that centre shows downtown Fort Worth with the campus at
  // the edge of the frame.
  mapCenter: [-97.324918, 32.748586],
  zoom: 17,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: FORT_WORTH_LAW_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: FortWorthLawSearchSources
};

export const FortWorthLawOptions: SpecialEventOptions = [];

export const FortWorthLawTs: AggiemapCustomMapConfiguration = {
  configuration: FortWorthLawConfiguration,
  options: FortWorthLawOptions,
  sources: FortWorthLawLayerSources,
  references: FORT_WORTH_LAW_LAYERS,
  type: 'general-map',
  discover: {
    id: FortWorthLawConfiguration.id,
    name: FortWorthLawConfiguration.name,
    description: 'Map of the Texas A&M University School of Law campus in Fort Worth.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/fort-worth-law.jpg'
  }
};
