/**
 * The ArcGIS Maps SDK for JavaScript this workspace runs (#1219, #1844).
 *
 * **The version is `@arcgis/core`'s, pinned exactly in `package.json`.** The SDK is part of the build:
 * every module is an ES module the bundler splits into lazy chunks, loaded through
 * `EsriModuleProviderService` or an `import()` of its own. Until #1844 the SDK came from Esri's CDN
 * through `esri-loader`, whose default had to be overridden here or the maps ran 4.23; that and
 * `@types/arcgis-js-api`, whose last real release was 4.27, are gone. The `__esri` types now come from
 * `@arcgis/core/interfaces`, named in each project's `tsconfig`
 * `types` by relative path, because `types` finds a bare package name only under `typeRoots`.
 *
 * **Esri's assets still come from its CDN**: workers, fonts, translations and the widget stylesheet, all
 * from `https://js.arcgis.com/<version>/@arcgis/core/assets`. That is `esriConfig.assetsPath`'s own default
 * for an `@arcgis/core` build, so nothing sets it. Serving them ourselves would mean copying the 57 MB
 * `assets` folder into every app that draws a map. The stylesheet is imported by `EsriMapComponent` from
 * the same path, so its version has to move with the package's.
 *
 * Moving to a newer release: change `@arcgis/core` in `package.json`, this constant, and the stylesheet's
 * URL in `esri-map.component.scss`, together.
 */
export const ESRI_RUNTIME_VERSION = '4.30';
