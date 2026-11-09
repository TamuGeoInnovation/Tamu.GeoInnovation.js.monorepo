import { ComposedSearchSourcesKeyMap } from './search-sources/search-sources';
import { IComposedIDefinitions } from './definitions';

/**
 * Layers and search sources that are finished enough to work on but not to show the public, each with the
 * issue keeping it off production (#2673).
 *
 * A production build leaves these out altogether: `factory()` folds them into the `exclude` options that
 * `LayerSources` and `SearchSources` already take, so the layer is absent from `Layers`, absent from search,
 * and its `urlQueryParam` link does nothing. A development build keeps all of it, which is the point - the
 * work carries on where it can be looked at.
 *
 * This is the layer equivalent of the lists in `test/smoke/aggiemap/development-only.ts`, and it is kept the
 * same way: **when a layer is ready, take it out of here and out of the smoke suite's
 * `DEVELOPMENT_ONLY_SERVICES` together.** The checks then require it to be present everywhere instead, so a
 * layer cannot be half-released.
 *
 * Why a list rather than a gate written at each layer: #1090 shipped the Bus Routes tab to production as a
 * button that apologised for being unavailable, because the gate was in a template and nothing asserted that
 * the production variant hid it. One named list is a thing a test can read.
 */
export const DEVELOPMENT_ONLY_LAYER_SOURCES: Array<{
  definition: keyof IComposedIDefinitions;
  searchSources: Array<keyof ComposedSearchSourcesKeyMap>;
  reason: string;
}> = [
  {
    definition: 'NATURE_RX',
    searchSources: ['NATURE_RX', 'NATURE_RX_EXACT'],
    reason: '#2673: Nature Rx is on the map but not ready for production'
  },
  {
    definition: 'MICROMOBILITY',
    searchSources: [],
    reason: '#2739: Micromobility, development-only on the main map as its own map is (#2712)'
  }
];

/** The definition keys a production build excludes from its layer sources. */
export function developmentOnlyDefinitions(): Array<keyof IComposedIDefinitions> {
  return DEVELOPMENT_ONLY_LAYER_SOURCES.map((source) => source.definition);
}

/** The search source keys a production build excludes. */
export function developmentOnlySearchSources(): Array<keyof ComposedSearchSourcesKeyMap> {
  return DEVELOPMENT_ONLY_LAYER_SOURCES.flatMap((source) => source.searchSources);
}
