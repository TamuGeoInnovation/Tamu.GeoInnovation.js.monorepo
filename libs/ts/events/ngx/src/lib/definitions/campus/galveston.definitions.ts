import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the Galveston satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `BUILDINGS` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum GALVESTON_LAYERS {
  BASEMAP = 'galveston-basemap-layer',
  BUILDINGS = 'galveston-buildings-layer'
}

export const GalvestonTs = satelliteCampus({
  id: 'galveston',
  name: 'Galveston',
  applicationName: 'Galveston Campus',
  introductionText: 'Map of the Texas A&M University at Galveston campus.',
  // Center/zoom derived from the campus building layer's full extent (GalvBase FeatureServer).
  center: [-94.818414, 29.316658],
  zoom: 16,
  layers: GALVESTON_LAYERS,
  basemap: { id: GALVESTON_LAYERS.BASEMAP, url: Connections.galvestonBasemapUrl },
  /**
   * Building search source for the Galveston campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (same base path, layer `0`, "University Structures").
   */
  buildings: {
    id: GALVESTON_LAYERS.BUILDINGS,
    url: `${Connections.galvestonFeatureServerUrl}/0`,
    kind: 'building',
    fields: { name: 'bldgname', abbreviation: 'bldgabbrev', number: 'number' },
    popupTitle: ['name', 'bldgname', 'bldgabbrev', 'abbrev'],
    state: 'TX'
  }
  // TODO: set `brandingIconUrl` to an official Texas A&M University at Galveston logo once one is
  // sourced. Until then, the sidebar falls back to the default TAMU branding block.
});

export const GalvestonLayerSources: LayerSource[] = GalvestonTs.sources;
export const GalvestonConfiguration: EventConfiguration = GalvestonTs.configuration;
