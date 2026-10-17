import { Injectable } from '@angular/core';

/**
 * Loads ArcGIS modules by short name (`'MapView'`, `'FeatureLayer'`), so callers do not name module paths.
 *
 * Each name maps to a dynamic `import()` of `@arcgis/core` (#1844), so the build splits every module into
 * its own lazy chunk and a page downloads only what it asks for, as it did when `esri-loader` fetched the
 * AMD modules from Esri's CDN. The interface is the one callers used with `esri-loader`: an array of
 * names in, an array (or with `asObject`, an object keyed by name) of modules out.
 */
@Injectable({ providedIn: 'root' })
export class EsriModuleProviderService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public require(modules: EsriAmdModule[]): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public require(modules: EsriAmdModule[], asObject: true): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public require(modules: EsriAmdModule[], asObject?: boolean): Promise<any> {
    return Promise.all(modules.map(load))
      .then((resolvedModules) => {
        if (asObject) {
          const obj = {};

          resolvedModules.forEach((module, index) => {
            obj[modules[index]] = module;
          });

          return obj;
        } else {
          return resolvedModules;
        }
      })
      .catch((error) => {
        throw new Error(`Could not resolve at least one of the modules ${modules.join(', ')}: ${error}`);
      });
  }
}

/** Each module's value once it has been asked for; see `load`. */
const loaded = new Map<EsriAmdModule, Promise<unknown>>();

/**
 * Imports `name` once, and hands every later caller the same settled promise (#1849).
 *
 * An `import()` of a module that has already loaded still waits for a task from the browser before it
 * resolves, and while ArcGIS 4.34 is drawing that wait was measured at 1.2 to 2.5 seconds per call. The map
 * service asks for `FeatureLayer` once per layer, one layer at a time, so the Football Transportation shuttle
 * map took over 90 seconds to add its 57 layers on dev. `esri-loader` answered a loaded module at once. A
 * settled promise resolves in a microtask, as that did. A failed import is not kept, so it can be tried again.
 */
function load(name: EsriAmdModule): Promise<unknown> {
  let module = loaded.get(name);

  if (!module) {
    module = dictionary[name]().then(moduleValue);
    module.catch(() => loaded.delete(name));
    loaded.set(name, module);
  }

  return module;
}

/**
 * What `esri-loader` handed back for a module: a class module's default export (`Map`, `FeatureLayer`), or
 * the module itself for one made of functions (`projectOperator`, `webMercatorUtils`, `rest/route`), which has no
 * default export.
 */
function moduleValue(module: { default?: unknown }): unknown {
  return 'default' in module ? module.default : module;
}

const dictionary = {
  Map: () => import('@arcgis/core/Map.js'),
  // Turns a renderer's JSON - including the CIM symbols a portal item publishes - into a renderer
  // instance. See portal-symbology.ts (#1497).
  rendererJsonUtils: () => import('@arcgis/core/renderers/support/jsonUtils.js'),
  MapView: () => import('@arcgis/core/views/MapView.js'),
  SceneView: () => import('@arcgis/core/views/SceneView.js'),
  TileLayer: () => import('@arcgis/core/layers/TileLayer.js'),
  VectorTileLayer: () => import('@arcgis/core/layers/VectorTileLayer.js'),
  // Required before the view's spatial reference can change, which happens when a basemap in a
  // different projection is selected. Without it the view's center does not survive the switch.
  // Replaces the `projection` module, deprecated in 4.32; its load() loads the same engine.
  projectOperator: () => import('@arcgis/core/geometry/operators/projectOperator.js'),
  Basemap: () => import('@arcgis/core/Basemap.js'),
  GraphicsLayer: () => import('@arcgis/core/layers/GraphicsLayer.js'),
  webMercatorUtils: () => import('@arcgis/core/geometry/support/webMercatorUtils.js'),
  SpatialReference: () => import('@arcgis/core/geometry/SpatialReference.js'),
  RouteParameters: () => import('@arcgis/core/rest/support/RouteParameters.js'),
  FeatureSet: () => import('@arcgis/core/rest/support/FeatureSet.js'),
  Graphic: () => import('@arcgis/core/Graphic.js'),
  Point: () => import('@arcgis/core/geometry/Point.js'),
  Polygon: () => import('@arcgis/core/geometry/Polygon.js'),
  Polyline: () => import('@arcgis/core/geometry/Polyline.js'),
  FeatureLayer: () => import('@arcgis/core/layers/FeatureLayer.js'),
  SceneLayer: () => import('@arcgis/core/layers/SceneLayer.js'),
  // Esri moved it to layers/support. The old esri/views/layers/support path this dictionary named 404s on
  // the 4.27 CDN, so the layer filter could not load it before #1844.
  FeatureFilter: () => import('@arcgis/core/layers/support/FeatureFilter.js'),
  SimpleLineSymbol: () => import('@arcgis/core/symbols/SimpleLineSymbol.js'),
  SimpleMarkerSymbol: () => import('@arcgis/core/symbols/SimpleMarkerSymbol.js'),
  // The geometry operators replace `geometryEngine`, deprecated in 4.32.
  unionOperator: () => import('@arcgis/core/geometry/operators/unionOperator.js'),
  // Replaces `Accessor.watch`, deprecated in 4.32.
  reactiveUtils: () => import('@arcgis/core/core/reactiveUtils.js'),
  PictureMarkerSymbol: () => import('@arcgis/core/symbols/PictureMarkerSymbol.js'),
  GeoJSONLayer: () => import('@arcgis/core/layers/GeoJSONLayer.js'),
  CSVLayer: () => import('@arcgis/core/layers/CSVLayer.js'),
  LegendViewModel: () => import('@arcgis/core/widgets/Legend/LegendViewModel.js'),
  LayerListViewModel: () => import('@arcgis/core/widgets/LayerList/LayerListViewModel.js'),
  SketchViewModel: () => import('@arcgis/core/widgets/Sketch/SketchViewModel.js'),
  Layer: () => import('@arcgis/core/layers/Layer.js'),
  GroupLayer: () => import('@arcgis/core/layers/GroupLayer.js'),
  Color: () => import('@arcgis/core/Color.js'),
  MapImageLayer: () => import('@arcgis/core/layers/MapImageLayer.js'),
  route: () => import('@arcgis/core/rest/route.js'),
  networkService: () => import('@arcgis/core/rest/networkService.js'),
  Stop: () => import('@arcgis/core/rest/support/Stop.js'),
  Collection: () => import('@arcgis/core/core/Collection.js'),
  IdentityManager: () => import('@arcgis/core/identity/IdentityManager.js'),
  OAuthInfo: () => import('@arcgis/core/identity/OAuthInfo.js'),
  BaseMapGalleryViewModel: () => import('@arcgis/core/widgets/BasemapGallery/BasemapGalleryViewModel.js'),
  LocalBasemapsSource: () => import('@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource.js'),
  WMSLayer: () => import('@arcgis/core/layers/WMSLayer.js')
} satisfies Record<string, () => Promise<object>>;

type EsriAmdModule = keyof typeof dictionary;
