/**
 * The ArcGIS Maps SDK for JavaScript this workspace runs (#1219, #1844).
 *
 * **The version is `@arcgis/core`'s, pinned exactly in `package.json`.** The SDK is part of the build:
 * every module is an ES module the bundler splits into lazy chunks, loaded through
 * `EsriModuleProviderService` or an `import()` of its own. Until #1844 the SDK came from Esri's CDN
 * through `esri-loader`, whose default had to be overridden here or the maps ran 4.23; that and
 * `@types/arcgis-js-api`, whose last real release was 4.27, are gone. The `__esri` types now come from
 * `@arcgis/core/interfaces`, named in each project's `tsconfig` `types` as
 * `../../node_modules/@arcgis/core/interfaces` at every depth: a relative `types` entry is resolved
 * from `typeRoots` (`node_modules/@types`), not from the `tsconfig`. Since 5.0 that entry is the only
 * way in: 4.x's module typings each imported `interfaces`, 5.0's do not (#1859). The namespace is
 * deprecated in 5.0 and goes in 6.0; Esri's `@arcgis/codemod` moves code to the module types.
 *
 * **Esri's assets still come from its CDN**: workers, fonts, translations and the widget stylesheet, all
 * from `https://js.arcgis.com/<version>/@arcgis/core/assets`. That is `esriConfig.assetsPath`'s own default
 * for an `@arcgis/core` build, so nothing sets it. Since 5.0 the default names the exact release
 * (`5.0.19`), where 4.x named the minor (`4.34`), so this constant does too (#1859). Serving them
 * ourselves would mean copying the 57 MB `assets` folder into every app that draws a map. The stylesheet is imported by `EsriMapComponent` from
 * the same path, so its version has to move with the package's.
 *
 * Moving to a newer release: change `@arcgis/core` in `package.json`, this constant, and the stylesheet's
 * URL in `esri-map.component.scss`, together. #1845 went from 4.27 to 4.34 that way, one minor release per
 * commit, each with the breaking changes it needed written in its commit message; read Esri's release notes
 * for every release skipped, since its typings change between minors (4.30 to 4.32 rewrote them).
 */
export const ESRI_RUNTIME_VERSION = '5.1.27';
