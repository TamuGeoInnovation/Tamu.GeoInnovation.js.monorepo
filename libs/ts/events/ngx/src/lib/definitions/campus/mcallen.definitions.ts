import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the McAllen satellite-campus map. `BASEMAP` is the visual vector-tile basemap.
 * `BUILDINGS` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the companion
 * `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without this
 * overlay clicking on a building would not show a popup (search-selected results still work since
 * those bypass `hitTest()` entirely).
 */
export enum MCALLEN_LAYERS {
  BASEMAP = 'mcallen-basemap-layer',
  BUILDINGS = 'mcallen-buildings-layer'
}

export const McAllenTs = satelliteCampus({
  id: 'mcallen',
  name: 'McAllen',
  applicationName: 'McAllen Campus',
  introductionText: 'Map of the Texas A&M Higher Education Center at McAllen campus.',
  description: 'Map of the Texas A&M University at McAllen campus.',
  // Center/zoom derived from the campus building layer's full extent (HigherEd FeatureServer, layer 2).
  center: [-98.263057, 26.344692],
  zoom: 18,
  layers: MCALLEN_LAYERS,
  basemap: { id: MCALLEN_LAYERS.BASEMAP, url: Connections.mcallenBasemapUrl },
  /**
   * Building search source for the McAllen Higher Ed campus, backed by the `FeatureServer` companion
   * to the vector-tile basemap (same base path, layer `2`, "McAllen Higher Ed Structures").
   */
  buildings: {
    id: MCALLEN_LAYERS.BUILDINGS,
    url: `${Connections.mcallenFeatureServerUrl}/2`,
    kind: 'building',
    fields: { name: 'name', abbreviation: 'abbrev', number: 'number' },
    // The McAllen layer has no address fields.
    state: null
  }
  // TODO: set `brandingIconUrl` to an official Texas A&M Higher Education Center at McAllen logo
  // once one is sourced. Until then, the sidebar falls back to the default TAMU branding block.
});

export const McAllenLayerSources: LayerSource[] = McAllenTs.sources;
export const McAllenConfiguration: EventConfiguration = McAllenTs.configuration;
