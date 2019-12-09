import { Injectable, Optional, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncSubject, Observable, BehaviorSubject } from 'rxjs';

import { EsriModuleProviderService } from './module-provider.service';

import { SearchService } from '@tamu-gisc/search';
import { getGeometryType } from '@tamu-gisc/common/utils/geometry/esri';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;
import FeatureLayerProperties = __esri.FeatureLayerProperties;

@Injectable()
export class EsriMapService {
  // Private store, which will contain the eventual map and view objects
  //
  // We use async subject because we want to control the flow of loading
  // BehaviorSubject requires an initial for which we don't have until the map and view classes have instantiated.
  // First initial value will break application since continued execution requires map and view.
  // ReplaySubject will work but need to declare the number of first emitted values.
  // AsyncSubject allows us to control when to emit map loaded, and emit map and view instances.
  //
  private _modules: NullableMapServiceInstance = {};

  private _store: AsyncSubject<MapServiceInstance> = new AsyncSubject();

  private _hitTest: BehaviorSubject<HitTestSnapshot> = new BehaviorSubject({ graphics: [] });

  public hitTest: Observable<HitTestSnapshot> = this._hitTest.asObservable();

  // Exposed observable that will be responsible for emitting values to subscribers
  public readonly store: Observable<MapServiceInstance> = this._store.asObservable();

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private router: Router,
    private searchService: SearchService,
    private environment: EnvironmentService
  ) {}

  public loadMap(mapProperties: MapProperties, viewProperties: MapViewProperties) {
    // If properties specifies 2d mode, load 2d map view.
    if (viewProperties.mode === '2d') {
      this.moduleProvider
        .require(['Map', 'MapView', 'TileLayer', 'Basemap'])
        .then(
          ([Map, MapView, TileLayer, Basemap]: [
            esri.MapConstructor,
            esri.MapViewConstructor,
            esri.TileLayerConstructor,
            esri.BasemapConstructor
          ]) => {
            this.next(mapProperties, viewProperties, Map, MapView, TileLayer, Basemap);
          }
        );
    } else if (viewProperties.mode === '3d') {
      // If properties specifies 3d mode, load 3d scene view.
      this.moduleProvider
        .require(['Map', 'SceneView', 'TileLayer', 'Basemap'])
        .then(
          ([Map, MapView, TileLayer, Basemap]: [
            esri.MapConstructor,
            esri.SceneViewConstructor,
            esri.TileLayerConstructor,
            esri.BasemapConstructor
          ]) => {
            this.next(mapProperties, viewProperties, Map, MapView, TileLayer, Basemap);
          }
        );
    }
  }

  /**
   * Bootstrapping function that continues the map creation after the 2d vs 3d determination is made.
   *
   * This function is used to keep code DRY.
   *
   * @private
   * @param {MapProperties} Properties
   * @param {MapViewProperties} ViewProperties
   * @param {esri.MapConstructor} Map
   * @param {esri.MapViewConstructor} MapView MapView or SceneView depending on mode
   * @param {esri.TileLayerConstructor} TileLayer
   * @param {esri.BasemapConstructor} Basemap
   * @memberof EsriMapService
   */
  private next(
    Properties: MapProperties,
    ViewProperties: MapViewProperties,
    Map: esri.MapConstructor,
    MapView: esri.MapViewConstructor | esri.SceneViewConstructor,
    TileLayer: esri.TileLayerConstructor,
    Basemap: esri.BasemapConstructor
  ): void {
    const basemap = this.makeBasemap(Properties, TileLayer, Basemap);
    this._modules.map = new Map(basemap);
    const viewProps = this.makeMapView(ViewProperties.properties, this._modules.map);
    this._modules.view = new MapView(viewProps);

    // Set the value of the async subject
    this._store.next({
      map: this._modules.map,
      view: this._modules.view
    });

    // Declare the async subject complete to emit value.
    this._store.complete();

    // Filter list of layers that need to be added on map load
    this.loadLayers(this.environment.value('LayerSources').filter((l) => l.loadOnInit));

    // Load faeture list from url (e.g. howdy links)
    this.selectFeaturesFromUrl();

    // Set up a hit test wrapper that can be subscribed to anywhere in the application.
    this._modules.view.on('click', (e) => {
      this._modules.view.hitTest(e).then((res: esri.HitTestResult) => {
        // Clear the hit test object regardless of router state
        this.clearHitTest();

        // Only set the hit test value if the current app route is not trip.
        // This is because we don't want to shop popup when trying to click
        // on map to set route which will overlay on top of trip planner controls
        if (!this.router.url.includes('trip')) {
          this._hitTest.next({ graphics: res.results.map((r) => r.graphic) });
        }
      });
    });
  }

  /**
   * Generates map a map view object utilizing view properties and the map instance.
   *
   * Internal use only.
   *
   * @param {esri.MapViewProperties} viewProperties
   * @param {esri.Map} map
   * @returns {esri.MapViewProperties}
   * @memberof EsriMapService
   */
  private makeMapView(viewProperties: esri.MapViewProperties, map: esri.Map): esri.MapViewProperties {
    // Make a clone of the passed in view properties
    const vProps = Object.assign({}, viewProperties);

    // If the supplied view properties does not have a map object, set it.
    if (!vProps.map) {
      vProps.map = map;
    }

    return vProps;
  }

  /**
   * Makes a basemap using custom basemap options or a simple basemap string id name.
   *
   * @param {*} mapProperties
   * @param {esri.TileLayerConstructor} TileLayer
   * @param {esri.BasemapConstructor} Basemap
   * @returns {esri.MapProperties}
   * @memberof EsriMapService
   */
  private makeBasemap(
    mapProperties,
    TileLayer: esri.TileLayerConstructor,
    Basemap: esri.BasemapConstructor
  ): esri.MapProperties {
    if (!mapProperties) {
      throw new Error(`No map properties were provided.`);
    }

    // Make new immutable object from passed in parameters.
    // This is to prevent accidental object mutation through reference.
    const mProps = JSON.parse(JSON.stringify(mapProperties));

    // Check if the basemap property is a string, which will autocast
    // Or if the basemap property contains a list of baselayers which need instantiation based on type.
    if (typeof mProps.basemap === 'string') {
      return mProps;
    } else if (typeof mProps.basemap === 'object') {
      // If there are no baseLayers, break early
      if (!mProps.basemap.baseLayers) {
        throw new Error(`Missing baseLayers property.`);
      }

      if (mProps.basemap.baseLayers.length <= 0) {
        throw new Error(`At least one baseLayer is required.`);
      }

      // Create Instantiate base layers depending on their type.
      mProps.basemap.baseLayers = mProps.basemap.baseLayers.map((l) => {
        if (!l.type) {
          throw new Error(`Layer type is required.`);
        }

        if (l.type === `TileLayer`) {
          // Remove the type property because it conflicts as a read-only property when instantiating the class.
          delete l.type;
          return new TileLayer(l);
        }
      });

      // Create an instance of the basemap.
      const bm = new Basemap(mProps.basemap);

      // Return a basemap property object.
      return Object.assign({}, { basemap: bm });
    }
  }

  /**
   * Returns a feature layer query result containing features that intersect, if any, a point
   *
   * @param {esri.FeatureLayer} featureLayer Feature layer used to calculate intersecting features
   * @param {esri.Point} point Point object to test against the feature layer
   * @returns {esri.FeatureSet} Feature set collection containing the features from feature
   * layer that intersect the point
   */
  public featuresIntersectingPoint(featureLayer: esri.FeatureLayer, point: esri.Point): Promise<esri.FeatureSet> {
    return new Promise((r, rj) => {
      featureLayer
        .queryFeatures({
          geometry: point,
          spatialRelationship: 'intersects',
          outFields: ['*'],
          returnGeometry: true
        })
        .then((res: esri.FeatureSet) => {
          r(res);
        })
        .catch((err) => {
          rj(err);
        });
    });
  }

  /**
   * Loads an array of layers from an array of layer sources, if each does not exist already.
   *
   * @param {LayerSource[]} sources
   * @memberof EsriMapService
   */
  public loadLayers(sources: LayerSource[]) {
    sources.forEach((source) => {
      this.findLayerOrCreateFromSource(source);
    });
  }

  /**
   * Check if a layer exists, source object.
   *
   * If layer exists, return layer.
   *
   * If layer does not exist, make layer with source properties and return the layer.
   *
   * @param {LayerSource} source
   * @memberof EsriMapService
   */
  public findLayerOrCreateFromSource(source: LayerSource): Promise<esri.Layer> {
    const map: esri.Map = this._modules.map;

    if (this.layerExists(source.id)) {
      return new Promise((r, rj) => {
        try {
          r(map.findLayerById(source.id));
        } catch (err) {
          rj(err);
        }
      });
    } else {
      const generateLayer = (layerSource: LayerSource): Promise<esri.Layer> => {
        // Set of persistent properties, that will be applied to all layer types.
        const persistentProps = {
          outFields: layerSource.native && 'outFields' in layerSource.native ? layerSource.native.outFields : ['*'],
          minScale: layerSource.native && 'minScale' in layerSource.native ? layerSource.native.minScale : 100000,
          maxScale: layerSource.native && 'maxScale' in layerSource.native ? layerSource.native.maxScale : 0,
          elevationInfo:
            layerSource.native && 'elevationInfo' in layerSource.native
              ? layerSource.native.elevationInfo
              : { mode: 'relative-to-ground', offset: 1 },
          popupEnabled: false
        };

        // Object with merged root level properties, native properties, and persistent properties.
        // const props: any = Object.assign(source, ...native, ...persistentProps);
        const props = { ...layerSource, ...layerSource.native, ...persistentProps };

        // Remove the 'native' property from the object since it's not needed in the layer creation.
        if (props.hasOwnProperty('native')) {
          delete props.native;
        }

        // Delete any additional properties to avoid polluting layer instances
        delete props.loadOnInit;

        if (layerSource.type === 'feature') {
          return this.moduleProvider.require(['FeatureLayer']).then(([FeatureLayer]: [esri.FeatureLayerConstructor]) => {
            // Delete the type property as it cannot be set on layer creation.
            delete props.type;

            // Create and return new feature layer
            return new FeatureLayer(props as esri.FeatureLayerProperties);
          });
        } else if (layerSource.type === 'scene') {
          return this.moduleProvider.require(['SceneLayer']).then(([SceneLayer]: [esri.SceneLayerConstructor]) => {
            // Delete the type property as it cannot be set on layer creation.
            delete props.type;

            // Create and return new scene layer
            return new SceneLayer(props as esri.SceneViewProperties);
          });
        } else if (layerSource.type === 'graphic') {
          return this.moduleProvider.require(['GraphicsLayer']).then(([GraphicsLayer]: [esri.GraphicsLayerConstructor]) => {
            // Delete the type property as it cannot be set on layer creation.
            delete props.type;

            // Create and return new graphics layer
            return new GraphicsLayer(props as esri.GraphicsLayerProperties);
          });
        } else if (layerSource.type === 'geojson') {
          return this.moduleProvider.require(['GeoJSONLayer']).then(([GeoJSONLayer]: [esri.GeoJSONLayerConstructor]) => {
            // Delete the type property as it cannot be set on layer creation.
            delete props.type;

            // Create and return new geojson layer
            return new GeoJSONLayer(props as esri.GeoJSONLayerProperties);
          });
        } else if (layerSource.type === 'csv') {
          return this.moduleProvider.require(['CSVLayer']).then(([CSVLayer]: [esri.CSVLayerConstructor]) => {
            // Delete the type property as it cannot be set on layer creation.
            delete props.type;

            // Create and return new geojson layer
            return new CSVLayer(props as esri.CSVLayerProperties);
          });
        }
      };

      // Generate the layer
      return generateLayer(source).then((layer) => {
        if (layer) {
          // Add layer to map
          (<esri.Map>this._modules.map).add(layer, source.layerIndex ? source.layerIndex : undefined);

          // Return layer in case further manipulation is needed.
          return layer;
        }
      });
    }
  }

  /**
   * Service wrapper for the findLayerById map class method.
   *
   * @param {string} id Layer id reference
   * @returns {esri.Layer}
   * @memberof EsriMapService
   */
  public findLayerById(id: string): esri.Layer {
    const map: esri.Map = this._modules.map;
    const layer = map.findLayerById(id);

    if (!layer) {
      console.warn(`Layer with ID '${id}' does not exist. Recommend layer creation.`);
    }

    return layer;
  }

  /**
   * Checks if the layer id exists in the service map instance.
   *
   * @param {string} id Unique string id for the layer.
   * @returns {boolean}
   * @memberof EsriMapService
   */
  public layerExists(id: string): boolean {
    const map: esri.Map = this._modules.map;
    if (this._modules.map) {
      return map.findLayerById(id) !== undefined;
    } else {
      throw new Error('Map instances does not exist.');
    }
  }

  /**
   * Sets hit test subject value to an empty array.
   *
   * @memberof EsriMapService
   */
  public clearHitTest() {
    this._hitTest.next({ graphics: [] });
  }

  /**
   * Method wrapper that gets a list of features from URL params, andcalls the search
   * service to find matching features.
   *
   * Search results then get passed to a selector method that takes care of symbolizing and adding to map.
   *
   * @memberof EsriMapService
   */
  public selectFeaturesFromUrl() {
    const list = this.getFeatureListFromURL();

    // Simple check to ensure the url contains feature reference list.
    if (list.length > 0) {
      // Submit request to the search service for all key values (feature references).
      this.searchService
        .search({
          returnObservable: true,
          sources: Array(list.length).fill('building'),
          values: list
        })
        .subscribe((res) => {
          // Process every search result and filter out those containing at least one feature
          // and return it as the match.

          const features: esri.Graphic[] = res.results
            .filter((result) => result.features.length > 0)
            .map((result) => result.features[0])
            .map((feature) => {
              const ft = { ...feature };

              (<{ type: unknown }>ft.geometry).type = getGeometryType(feature.geometry);

              return ft as esri.Graphic;
            });

          // If the matched feature count is greater than 0, proceed to select them.
          if (features.length > 0) {
            if (features.length === 1) {
              this.selectFeatures({
                graphics: features,
                shouldShowPopup: true
              });
            } else {
              this.selectFeatures({
                graphics: features
              });
            }
          }
        });
    }
  }

  /**
   * Gets a list of features from url params.
   *
   * @returns {string[]}
   * @memberof EsriMapService
   */
  public getFeatureListFromURL(): string[] {
    // Dictionary of expected URL parameters that include a list of feature references
    const buildingParameterDictionary = ['bldg', 'Bldg', 'BldgAbbrv', 'bldgabbrv'];

    // Parse the current URL into a URL tree
    const tree = this.router.parseUrl(this.router.url);

    // Check for matching dictionary keys in the parsed url tree
    const keyExists = buildingParameterDictionary.find((key) => tree.queryParams.hasOwnProperty(key));

    // If there is a matching key in the dictionary and the current url tree,
    // then proceed submit queries to the search sources for matches.
    if (keyExists && tree.queryParams[keyExists].trim().length > 0) {
      const rawParamList = tree.queryParams[keyExists].split(',');
      // Filter out duplicate values
      return rawParamList.filter((value, index, array) => array.indexOf(value) === index);
    } else {
      return [];
    }
  }

  /**
   * Processes and highlights a collection of esri graphics into a preset selection graphics layer.
   *
   * If the layer does not exist, it will be created.
   *
   * @param {SelectFeaturesProperties} properties
   * @memberof EsriMapService
   */
  public selectFeatures(properties: SelectFeaturesProperties) {
    const graphics = properties.graphics || [];
    const shouldShowPopup = properties.shouldShowPopup || false;

    // Source object
    const source = Object.assign(this.environment.value('LayerSources').find((src) => src.id === 'selection-layer'));

    // Add the symbol and polygon type to each feature
    const features = graphics.map((ft) => {
      const feature = ft;
      feature.symbol = this.environment.value('SelectionSymbols')[ft.geometry.type];

      return feature;
    });

    if (this.layerExists(source.id)) {
      // If the layer has been added before, graphics will simply be replaced
      this.findLayerOrCreateFromSource(source)
        .then((layer: esri.GraphicsLayer) => {
          layer.removeAll();
          layer.addMany(features);
          return layer;
        })
        .then((layer) => {
          if (shouldShowPopup) {
            this._hitTest.next({ graphics: layer.graphics.toArray(), popupComponent: properties.popupComponent });
          }

          return layer.graphics.toArray();
        })
        .then((grfx) => {
          this.computeZoomLevel(grfx).then((zoom) => {
            this.zoomTo({
              graphics: grfx,
              zoom: zoom
            });
          });
        });
    } else {
      // If the layer has not been added before, instantiate it with the features as a source
      this.findLayerOrCreateFromSource(Object.assign(source, { graphics: features }))
        .then((layer: esri.GraphicsLayer) => {
          if (properties.shouldShowPopup) {
            this._hitTest.next({ graphics: layer.graphics.toArray(), popupComponent: properties.popupComponent });
          }

          return layer.graphics.toArray();
        })
        .then((grfx) => {
          this.computeZoomLevel(grfx).then((zoom) => {
            this.zoomTo({
              graphics: grfx,
              zoom: zoom
            });
          });
        });
    }
  }

  /**
   * Clears all graphics from the selection layer
   *
   * @memberof EsriMapService
   */
  public clearSelectedFeatures() {
    // Source object
    const source = Object.assign(this.environment.value('LayerSources').find((src) => src.id === 'selection-layer'));

    this.findLayerOrCreateFromSource(source).then((layer: esri.GraphicsLayer) => {
      layer.removeAll();
    });
  }

  /**
   * Invokes native esri zoomTo map view method using the stored service map and view instances.
   *
   *  Zooms to a collection of graphics at a specified zoom.
   *
   * @param {ZoomProperties} properties
   * @returns
   * @memberof EsriMapService
   */
  public zoomTo(properties: ZoomProperties) {
    return new Promise((r, rj) => {
      (<esri.MapView>this._modules.view).goTo({
        target: properties.graphics,
        zoom: properties.zoom
      });
    });
  }

  /**
   * Computes the most appropriate zoom level for a collection of graphics.
   *
   * Calculates the longest edge of the graphic collection envelope and uses that
   * value to determine a best-fit zoom level.
   *
   * @param {Array < esri.Graphic >} graphics
   * @returns {Promise < number >}
   * @memberof EsriMapService
   */
  public computeZoomLevel(graphics: Array<esri.Graphic>): Promise<number> {
    return this.moduleProvider.require(['GeometryEngine']).then(([GeometryEngine]: [esri.geometryEngine]) => {
      const geometries: esri.Geometry[] = graphics.map((graphic) => graphic.geometry);
      const result = GeometryEngine.union(geometries);

      if (result.extent) {
        const xMin = result.extent.xmin;
        const xMax = result.extent.xmax;
        const yMin = result.extent.ymin;
        const yMax = result.extent.ymax;

        const xDiff = xMax - xMin;
        const yDiff = yMax - yMin;

        const maximum = Math.max(xDiff, yDiff);

        if (maximum <= 0.0001) {
          return 20;
        } else if (maximum > 0.0001 && maximum <= 0.004) {
          return 19;
        } else if (maximum > 0.004 && maximum <= 0.01) {
          return 17;
        } else {
          return undefined;
        }
      } else {
        // Return a default value
        return 19;
      }
    });
  }
}

export interface MapConfig {
  basemap: MapProperties;
  view: MapViewProperties;
}

interface MapProperties extends esri.MapProperties {
  basemap: BaseMapProperties | string;
}

interface BaseMapProperties extends esri.BasemapProperties {
  baseLayers: [LayerProperties];
}

interface LayerProperties extends esri.LayerProperties, esri.TileLayerProperties, esri.VectorTileLayerProperties {
  type: string;
}

/**
 * Locally stored esri map and view class insntances
 *
 * @export
 * @interface MapServiceInstance
 */
export interface MapServiceInstance {
  map: esri.Map;
  view: esri.MapView | esri.SceneView;
}
interface NullableMapServiceInstance extends Partial<MapServiceInstance> {}

/**
 * Defines a graphics collection and any additional options that should be used in the selection.
 *
 * @interface SelectFeaturesProperties
 */
interface SelectFeaturesProperties {
  /**
   * Esri graphic feature array
   *
   * @type {esri.Graphic[]}
   * @memberof selectFeaturesProperties
   */
  graphics: esri.Graphic[];

  /**
   * If set to true, will open up popup for the first element in the graphics property.
   *
   * Multiple feature popup is not supported yet.
   *
   * @type {boolean}
   * @memberof selectFeaturesProperties
   */
  shouldShowPopup?: boolean;

  /**
   * Assigns an optional popup component override reference if `shouldShowPopup` is true.
   *
   * Cases justifying this property include search result feature selection which default
   * to the selection layer which in turn defaults to a preset component template specific
   * in the environments file. In those cases, specifying a popup component allows proper
   * or conditional rendering.
   *
   * @type {string}
   * @memberof SelectFeaturesProperties
   */
  popupComponent?: string;
}

interface ZoomProperties {
  graphics: esri.Graphic[];
  zoom: number;
}

export interface HitTestSnapshot {
  graphics: esri.Graphic[];

  /**
   * Cases justifying this property include search result feature selection which default
   * to the selection layer which in turn defaults to a preset component template specific
   * in the environments file. In those cases, specifying a popup componentallows proper or
   *  conditional rendering.
   *
   * @type {string}
   * @memberof HitTestSnapshot
   */
  popupComponent?: string;
}

export interface MapViewProperties {
  /**
   * Describes the mapping mode for the view.
   *
   * 2d will use a MapView
   *
   * 3d will use a SceneView
   *
   * @type {('2d' | '3d')}
   * @memberof MapViewProperties
   */
  mode: '2d' | '3d';

  /**
   * Native ArcGIS JS MapView Properties
   *
   * @type {esri.MapViewProperties}
   * @memberof MapViewProperties
   */
  properties: esri.MapViewProperties;
}
