import { setDefaultOptions } from 'esri-loader';

/**
 * The ArcGIS JavaScript runtime this workspace loads (#1219).
 *
 * The API is fetched from Esri's CDN at runtime, not bundled, and **nothing in this repository used
 * to pin it** - the version came from `esri-loader`'s own default, which is 4.23, released in 2022.
 * Bugs Esri has fixed since were still reaching our maps, and an unpinned default means the version
 * could also move under us without a commit.
 *
 * 4.27 is as far as the runtime goes for now. Every release through 4.34 still serves the AMD build
 * `esri-loader` needs, so the ceiling is not technical - it is the types.
 *
 * **The types match the runtime: `@types/arcgis-js-api` 4.27** (#1322). Moving them from 4.23 took 18
 * build errors across 8 files: arrow markers on lines now need `type: 'line-marker'`, a hit test can
 * return media and route hits that carry no graphic, `FeatureLayerElevationInfo` became
 * `FeatureLayerBaseElevationInfo`, and the task classes (`QueryTask`, `RouteTask` and their support
 * types) are gone in favour of `esri/rest/*`. The 4.27 runtime no longer serves the task modules at
 * all, so anything still loading them fails at runtime. The last thing that did, the old standalone
 * Ring Day app, was removed in #1236.
 *
 * Note also that `@types/arcgis-js-api` 4.28 and later are deprecated stubs carrying no types at all -
 * they depend on `arcgis-js-api: *`. 4.27 is the last real one, so 4.27 is the ceiling for matched
 * types until the move to `@arcgis/core`.
 */
export const ESRI_RUNTIME_VERSION = '4.27';

let configured = false;

/**
 * Pins the runtime, once per page.
 *
 * `setDefaultOptions` is global to `esri-loader` and must run before the first `loadModules`, so this
 * is called as a side effect of importing the Esri library rather than left to each caller to
 * remember - there are nine call sites across the applications, and one that forgot would silently
 * load a different version.
 *
 * Calling it after modules have loaded throws, so it is guarded: a second call is a no-op rather than
 * an error.
 */
export function configureEsriRuntime(): void {
  if (configured) {
    return;
  }

  configured = true;
  setDefaultOptions({ version: ESRI_RUNTIME_VERSION });
}

configureEsriRuntime();
