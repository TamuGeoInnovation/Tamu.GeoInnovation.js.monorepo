import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the DC/Bush School satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on the property would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum DC_BUSH_SCHOOL_LAYERS {
  BASEMAP = 'dc-bush-school-basemap-layer',
  PROPERTY = 'dc-bush-school-property-layer'
}

export const DCBushSchoolTs = satelliteCampus({
  id: 'dc-bush-school',
  name: 'DC / Bush School',
  applicationName: 'Washington DC Campus',
  introductionText: 'Map of the Texas A&M Bush School of Government & Public Service campus in Washington, D.C.',
  description: 'Map of the Texas A&M University at Washington, DC campus.',
  // Center/zoom derived from the campus property layer's full extent (DCBush FeatureServer).
  center: [-77.037605, 38.903422],
  zoom: 19,
  layers: DC_BUSH_SCHOOL_LAYERS,
  basemap: { id: DC_BUSH_SCHOOL_LAYERS.BASEMAP, url: Connections.dcBushSchoolBasemapUrl },
  /**
   * Property search source for the DC / Bush School campus, backed by the `FeatureServer` companion
   * to the vector-tile basemap (same base path, layer `0`, "Bush-DC Buildings"). Since the services
   * were republished as `Hosted/DCBush` (#1110) the layer carries the same building fields as
   * Galveston/McAllen, except that the abbreviation field is `bldgabbr`, not `bldgabbrev`.
   */
  buildings: {
    id: DC_BUSH_SCHOOL_LAYERS.PROPERTY,
    url: `${Connections.dcBushSchoolFeatureServerUrl}/0`,
    kind: 'property',
    // The DC layer has no `name` field, and its abbreviation field is `bldgabbr`.
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'DC'
  }
  // TODO: set `brandingIconUrl` to an official Bush School of Government & Public Service (D.C.
  // campus) logo once one is sourced. Until then, the sidebar falls back to the default TAMU
  // branding block.
});

export const DCBushSchoolLayerSources: LayerSource[] = DCBushSchoolTs.sources;
export const DCBushSchoolConfiguration: EventConfiguration = DCBushSchoolTs.configuration;
