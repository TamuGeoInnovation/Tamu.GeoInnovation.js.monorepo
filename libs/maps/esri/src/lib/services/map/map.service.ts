import { Injectable, Component, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, lastValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Layer from '@arcgis/core/layers/Layer';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import {
  AutocastableLayer,
  cleanPortalJSONLayer,
  getGeometryType,
  getLayerTypeFromPortalJSON,
  IPortalLayer
} from '@tamu-gisc/common/utils/geometry/esri';
import { LayerSource, IRemoteLayerService, GroupLayerSourceProperties } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { LayerSourcesService } from '../layer-sources/layer-sources.service';

@Injectable({ providedIn: 'root' })
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

  private _store: BehaviorSubject<MapServiceInstance> = new BehaviorSubject(undefined);

  private _hitTest: BehaviorSubject<HitTestSnapshot> = new BehaviorSubject({ graphics: [] });

  private _mapContainer: HTMLDivElement;

  private _viewClickHandle: IHandle;

  public hitTest: Observable<HitTestSnapshot> = this._hitTest.asObservable();

  // Exposed observable that will be responsible for emitting values to subscribers
  public readonly store: Observable<MapServiceInstance> = this._store.asObservable().pipe(filter((s) => s !== undefined));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private environment: EnvironmentService,
    private http: HttpClient,
    private layerSourcesService: LayerSourcesService
  ) {}

  public loadMap(mapProperties: MapProperties, viewProperties: ViewProperties) {
    // If properties specifies 2d mode, load 2d map view.
    if (viewProperties.mode === '2d') {
      this.next(mapProperties, viewProperties, MapView);
    } else if (viewProperties.mode === '3d') {
      // If properties specifies 3d mode, load 3d scene view.
      this.next(mapProperties, viewProperties, SceneView);
    }
  }

  /**
   * Bootstrapping function that continues the map creation after the 2d vs 3d determination is made.
   *
   * @param {MapProperties} Properties
   * @param {ViewProperties} ViewProperties
   * @param {typeof MapView | typeof SceneView} ViewConstructor MapView or SceneView depending on mode
   */
  private async next(
    Properties: MapProperties,
    ViewProps: ViewProperties,
    ViewConstructor: typeof MapView | typeof SceneView
  ): Promise<void> {
    const basemap = this.makeBasemap(Properties);
    this._modules.map = new EsriMap(basemap);

    this._mapContainer = ViewProps.properties.container as HTMLDivElement;

    const props = this.makeMapView(ViewProps.properties, this._modules.map);
    this._modules.view = new ViewConstructor(props as __esri.MapViewProperties & __esri.SceneViewProperties);

    // Set the value of the async subject
    this._store.next({
      map: this._modules.map,
      view: this._modules.view
    });

    const layerSources: Array<LayerSource> = this.filterLayerSources(null, { params: true });

    // Filter list of layers that need to be added on map load
    await this.loadLayers(layerSources);

    // Load feature list from url (e.g. howdy links)
    this.selectFeaturesFromUrl();

    this.registerViewClickEventHandler();
  }

  public destroy() {
    if (this._modules.map !== undefined && this._modules.view !== undefined) {
      this._modules.map.destroy();
      this._modules.view.destroy();

      this._store.next(undefined);
    }
  }

  /**
   * Generates map a map view object utilizing view properties and the map instance.
   *
   * Internal use only.
   */
  private makeMapView(viewProperties: __esri.MapViewProperties | __esri.SceneViewProperties, map: EsriMap) {
    // Make a shallow clone of the passed in view properties
    const vProps = Object.assign({}, viewProperties);

    // If the supplied view properties does not have a map object, set it.
    if (!vProps.map) {
      vProps.map = map;
    }

    return vProps;
  }

  public setView(view: SceneView | MapView) {
    this.destroyViewClickEventHandler();

    this._modules.view.container = null;
    this._modules.view = null;
    this._modules.view = view;

    this._modules.view.container = this._mapContainer;

    this._store.next({ ...this._store.getValue(), view: this._modules.view });

    this.registerViewClickEventHandler();
  }

  private registerViewClickEventHandler() {
    // Set up a hit test wrapper that can be subscribed to anywhere in the application.
    this._viewClickHandle = this._modules.view.on('click', (e) => {
      this._modules.view.hitTest(e).then((res: __esri.HitTestResult) => {
        // Clear the hit test object regardless of router state
        this.clearHitTest();

        // Only set the hit test value if the current app route is not trip.
        // This is because we don't want to shop popup when trying to click
        // on map to set route which will overlay on top of trip planner controls
        if (!this.router.url.includes('trip')) {
          const graphics = res.results
            .filter((r): r is __esri.GraphicHit => r.type === 'graphic')
            .map((r) => r.graphic);
          this._hitTest.next({ graphics });
        }
      });
    });
  }

  private destroyViewClickEventHandler() {
    if ('remove' in this._viewClickHandle) {
      this._viewClickHandle.remove();
    }
  }

  /**
   * Makes a basemap using custom basemap options or a simple basemap string id name.
   */
  private makeBasemap(
    mapProperties
  ): __esri.MapProperties {
    if (!mapProperties) {
      throw new Error(`No map properties were provided.`);
    }

    // Make new immutable object from passed in parameters.
    // This is to prevent accidental object mutation through reference.
    const mProps = JSON.parse(JSON.stringify(mapProperties));

    // Check if the basemap property is a string, which will autocast
    // Or if the basemap property contains a list of base layers which need instantiation based on type.
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
  public featuresIntersectingPoint(featureLayer: FeatureLayer, point: __esri.Point): Promise<__esri.FeatureSet> {
    return new Promise((r, rj) => {
      featureLayer
        .queryFeatures({
          geometry: point,
          spatialRelationship: 'intersects',
          outFields: ['*'],
          returnGeometry: true
        })
        .then((res: __esri.FeatureSet) => {
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
   */
  public async loadLayers(sources: LayerSource[]) {
    await this.registerIdentityAuthInfos(sources);

    for (const source of sources) {
      await this.findLayerOrCreateFromSource(source);
    }
  }

  public async generateLayer(source: LayerSource | AutocastableLayer): Promise<Layer | Array<Layer>> {
    // Object with merged root level properties, native properties, and persistent properties.
    let props;

    // Check if the incoming source has the native property because Autocastable layers do not.
    if ('native' in source) {
      props = { ...source, ...(source as LayerSource).native };
    } else {
      props = { ...source };
    }

    // Remove the 'native' property from the object since it's not needed in the layer creation.
    if ('native' in props) {
      delete props.native;
    }

    // Delete any additional properties to avoid polluting layer instances
    if ('loadOnInit' in props) {
      delete props.loadOnInit;
    }

    if (source.type === 'feature') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new feature layer
      return new FeatureLayer(props as __esri.FeatureLayerProperties);
    } else if (source.type === 'map-image') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new map image layer
      return new MapImageLayer(props as __esri.MapImageLayerProperties);
    } else if (source.type === 'scene') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new scene layer
      return new SceneLayer(props as __esri.SceneLayerProperties);
    } else if (source.type === 'graphics') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new graphics layer
      return new GraphicsLayer(props as __esri.GraphicsLayerProperties);
    } else if (source.type === 'geojson') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new geojson layer
      return new GeoJSONLayer(props as __esri.GeoJSONLayerProperties);
    } else if (source.type === 'csv') {
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // Create and return new csv layer
      return new CSVLayer(props as __esri.CSVLayerProperties);
    } else if (source.type === 'group') {
      const s: GroupLayerSourceProperties = source;
      // Delete the type property as it cannot be set on layer creation.
      delete props.type;

      // If sources have been defined in the layer source, cast them into their respective layer types.
      if (s.sources) {
        const layerPromises = s.sources.map((ls) => this.generateLayer(ls));

        const layers = await Promise.all(layerPromises);

        // Create and return new group layer
        return new GroupLayer({ ...props, layers: layers } as __esri.GroupLayerProperties);
      } else {
        // Create and return new group layer
        return new GroupLayer(props as __esri.GroupLayerProperties);
      }
    } else if (source.type === 'unknown') {
      return Layer.fromArcGISServerUrl({
        url: source.url
      }).then((l) => {
        delete props.type;

        return Object.assign(l, props);
      });
    } else if (source.type === 'map-server') {
      if (source.auth) {
        // Identity manager should have AuthInfos registered to it at this point. Query the identity manager
        // to fetch the associated access token to make a raw GET request for the layer's JSON source.
        return IdentityManager.getCredential(
          source.auth.overrideCredentialUrl ? source.auth.overrideCredentialUrl : source.auth.info.portalUrl
        ).then((cred) => {
          return this.resolveLayerFromJsonp(source, { f: 'pjson', token: cred.token });
        });
      } else {
        return this.resolveLayerFromJsonp(source, { f: 'pjson' });
      }
    }
  }

  /**
   * Fetches the raw JSON from a source url and passes the resulting JSON
   * to another method that resolves the individual layers.
   */
  private resolveLayerFromJsonp(source, props: { [key: string]: string | number | boolean }) {
    return lastValueFrom(this.http.get(source.url, { params: { ...props } })).then(
      (res: { layers: Array<IPortalLayer> }) => {
        return this.resolveUnloadedLayers({
          layers: res.layers,
          source: source
        });
      }
    );
  }

  /**
   * Check if a layer exists, source object.
   *
   * If layer exists, return layer.
   *
   * If layer does not exist, make layer with source properties and return the layer.
   *
   * @param {LayerSource} source
   */
  public findLayerOrCreateFromSource(source: LayerSource): Promise<Layer | Array<Layer>> {
    const map: EsriMap = this._modules.map;

    if (this.layerExists(source.id)) {
      return new Promise((r, rj) => {
        try {
          r(map.findLayerById(source.id));
        } catch (err) {
          rj(err);
        }
      });
    } else {
      // Generate the layer
      return this.generateLayer(source).then((layerOrLayers) => {
        if (layerOrLayers instanceof Array) {
          // Add layer to map
          (<EsriMap>this._modules.map).addMany(layerOrLayers, source.layerIndex ?? undefined);

          // Return layer in case further manipulation is needed.
          return layerOrLayers;
        } else {
          // Add layer to map
          (<EsriMap>this._modules.map).add(layerOrLayers, source.layerIndex ?? undefined);

          // Return layer in case further manipulation is needed.
          return layerOrLayers;
        }
      });
    }
  }

  public async resolveUnloadedLayers(args: IResolveUnloadedLayersProperties): Promise<Array<Layer>> {
    if (args.layers.length === 0) {
      return await [];
    }

    const typed = args.layers.map((sl) => {
      return { ...sl, type: getLayerTypeFromPortalJSON(sl) } as IPortalLayer;
    });

    const casted = await Promise.all(
      typed.map((t) => {
        const cleaned = cleanPortalJSONLayer(t, (args.source as IRemoteLayerService).url);

        // `map-server` layer source type can have additional native properties for different kinds of layers.
        // We need to unpack them and merge them to the `cleaned` auto-castable layer props.
        if (args.source.type === 'map-server') {
          if (cleaned.type === 'feature') {
            Object.assign(cleaned, args.source.native.defaultFeatureLayerProperties);
          } else if (cleaned.type === 'group') {
            Object.assign(cleaned, args.source.native.defaultGroupLayerProperties);
          }
        }

        return this.generateLayer({ ...cleaned, ...args.source.native } as unknown as AutocastableLayer);
      })
    );

    // Merge the resolved layer inside the typed layer definitions. The grouping will be done against the typed object properties
    // to avoid having to deal with needing to resolve nested promises.
    const merged = typed.map((t, index) => {
      return { ...t, resolvedLayer: casted[index] } as unknown as IPortalLayer;
    });

    const rootParents = merged.filter((p) => p.parentLayerId === -1);

    const mapped = rootParents.map((parent) => {
      return this.getChildLayers(parent, { ...args, layers: merged });
    });

    return mapped;
  }

  /**
   * Identifies layer sources with authentication requirements and initializes their
   * auth infos against the identity service. This step allows the ArcGIS JS API to make
   * authenticated requests to secure resources.
   */
  private async registerIdentityAuthInfos(sources: LayerSource[]) {
    const sourcesWithAuthInfo = sources.filter((s) => {
      return s.auth;
    });

    if (sourcesWithAuthInfo.length > 0) {
      const sourcesNotYetInIdentityManager = sourcesWithAuthInfo.filter((source) => {
        const identityManagerInfo = IdentityManager.findOAuthInfo(source.auth.info.portalUrl);

        // We want to filter out the only the OAuthInfos **NOT** already registered in the IdentityService.
        if (identityManagerInfo !== undefined) {
          return false;
        } else {
          return true;
        }
      });

      // Return early
      if (sourcesNotYetInIdentityManager.length === 0) {
        return;
      }

      const infos = sourcesNotYetInIdentityManager.map((source) => {
        return new OAuthInfo(source.auth.info);
      });

      IdentityManager.registerOAuthInfos(infos);

      // Some layer sources may  have been marked to resolve credentials immediately, otherwise the layers might prompt
      // for additional login prompts. Filter out only the layer sources that have that requirement and fetch the credentials
      // from the server.
      const sourcesWithImmediateCredentialResolve = sourcesNotYetInIdentityManager.filter(
        (source) => source.auth.forceCredentialFetch
      );

      // Return early
      if (sourcesWithImmediateCredentialResolve.length === 0) {
        return;
      }

      sourcesWithImmediateCredentialResolve.forEach((source) => {
        const url = source.auth.overrideCredentialUrl ? source.auth.overrideCredentialUrl : source.auth.info.portalUrl;

        IdentityManager.getCredential(url);
      });

      return;
    } else {
      return;
    }
  }

  private getChildLayers(parent: IPortalLayer, args: IResolveUnloadedLayersProperties) {
    if (parent.subLayerIds !== null) {
      const layers = parent.subLayerIds.map((sl) => {
        const child = args.layers.find((listItem) => listItem.id === sl);

        return this.getChildLayers(child, args);
      });

      const inverted = parent.resolvedLayer;

      (inverted as unknown as __esri.GroupLayerProperties).layers = layers;

      return inverted;
    }

    return parent.resolvedLayer;
  }

  /**
   * Service wrapper for the findLayerById map class method.
   *
   * @param {string} id Layer id reference
   */
  public findLayerById(id: string): Layer {
    const map: EsriMap = this._modules.map;
    const layer = map.findLayerById(id);

    if (!layer) {
      console.warn(`Layer with ID '${id}' does not exist. Recommend layer creation.`);
    }

    return layer;
  }

  /**
   * Removes a list of layers by ID. Ignores invalid layer ID's.
   */
  public removeLayersById(ids: Array<string>): void {
    const map = this._modules.map;

    const layers = ids.map((lid) => map.findLayerById(lid)).filter((layer) => layer !== undefined);

    map.removeMany(layers);
  }

  public removeLayerById(id: string): void {
    const map: EsriMap = this._modules.map;
    const layer = map.findLayerById(id);

    if (!layer) {
      console.warn(`Cannot delete layer with ID ${id} that does not exist.`);
    } else {
      map.remove(layer);
    }
  }

  /**
   * Checks if the layer id exists in the service map instance.
   *
   * @param {string} id Unique string id for the layer.
   */
  public layerExists(id: string): boolean {
    const map: EsriMap = this._modules.map;
    if (this._modules.map) {
      return map.findLayerById(id) !== undefined;
    } else {
      throw new Error('Map instances does not exist.');
    }
  }

  public triggerHitTest(hit: HitTestSnapshot) {
    this._hitTest.next({ ...hit });
  }

  /**
   * Sets hit test subject value to an empty array.
   *
   */
  public clearHitTest() {
    this._hitTest.next({ graphics: [] });
  }

  /**
   * Returns a list of layer sources, applying various filters if specified. This is used
   * to limit the number of layers that are loaded on map load when requested.
   *
   * @param {LayerSource[]} sources
   * @param {{ params?: boolean }} [filters] Optional filters to apply to the layer sources.
   * If `params` is set to true, it will return only those layers that have an `essential` property defined AND
   * the current application route contains 'layers' query params.
   */
  public filterLayerSources(sources?: LayerSource[], filters?: { params?: boolean }): Array<LayerSource> {
    // Get the layer sources from the layer sources service, with overrides applied
    let ret: Array<LayerSource> = sources || this.layerSourcesService.getLayerSourcesWithOverrides();

    if (!ret || ret.length === 0) {
      // If no layer sources are defined, return an empty array
      console.warn('No layer sources defined in the environment. Not loading any layers.');

      return [];
    }

    if (filters && filters?.params) {
      const queryParams = this.route.snapshot.queryParams;

      if (queryParams && queryParams['layers']) {
        const requestedLayerIds: Array<string> = queryParams['layers'].split(',');

        // If the filters parameter is set, filter out any layer sources that do not have a params property
        ret = ret
          .filter((source) => {
            return source?.essential || requestedLayerIds.includes(source.id);
          })
          .map((s) => {
            return { ...s, visible: true };
          });
      }
    }

    return ret;
  }

  /**
   * Method wrapper that gets a list of features from URL params, and calls the search
   * service to find matching features.
   *
   * Search results then get passed to a selector method that takes care of symbolizing and adding to map.
   *
   */
  public selectFeaturesFromUrl() {
    const extractionResult = this.getFeatureListFromURL();

    if (!extractionResult?.identifiersList?.length) {
      return;
    }

    const repeatedDataset = extractionResult.identifiersList.reduce((acc, _) => {
      acc.push(extractionResult.dataset);
      return acc;
    }, [] as string[]);

    this.searchService
      .search<__esri.Graphic>({
        returnObservable: true,
        sources: repeatedDataset,
        values: extractionResult.identifiersList
      })
      .subscribe((queryResults) => {
        const validGraphics = queryResults.results.reduce((collection, resultItem) => {
          if (resultItem.features?.length) {
            const primaryGraphic = resultItem.features[0];
            const clonedGraphic = { ...primaryGraphic };
            (<{ type: unknown }>clonedGraphic.geometry).type = getGeometryType(primaryGraphic.geometry);
            collection.push(clonedGraphic as __esri.Graphic);
          }
          return collection;
        }, [] as __esri.Graphic[]);

        if (validGraphics.length) {
          this.selectFeatures({
            graphics: validGraphics,
            shouldShowPopup: validGraphics.length === 1,
            popupComponent: extractionResult.popupComponent
          });
        }
      });
  }

  /**
   * Gets a list of features from url params by matching against search source URL parameter configurations.
   */
  public getFeatureListFromURL(): { dataset: string; identifiersList: string[]; popupComponent?: Type<Component> } | null {
    const parsedRoute = this.router.parseUrl(this.router.url);
    const queryParameters = parsedRoute.queryParams;
    
    // Get search sources from environment
    const searchSources = this.environment.value('SearchSources');
    
    if (!searchSources || !Array.isArray(searchSources)) {
      return null;
    }
    
    // Find the first search source that matches any URL parameter
    for (const searchSource of searchSources) {
      if (!searchSource.urlQueryParam) {
        continue;
      }
      
      // Build list of all parameters to check (primary + aliases)
      const paramsToCheck = [searchSource.urlQueryParam];
      if (searchSource.urlQueryParamAliases) {
        paramsToCheck.push(...searchSource.urlQueryParamAliases);
      }
      
      // Check if any of these parameters exist in the URL
      const matchedParam = paramsToCheck.find(param => queryParameters[param]);
      
      if (matchedParam) {
        const parameterValue = queryParameters[matchedParam];
        
        if (parameterValue?.trim()) {
          const tokens = parameterValue.split(',');
          const deduplicatedTokens = tokens.reduce((uniqueList, token) => {
            if (!uniqueList.includes(token)) {
              uniqueList.push(token);
            }
            return uniqueList;
          }, [] as string[]);
          
          return {
            dataset: searchSource.source,
            identifiersList: deduplicatedTokens,
            popupComponent: searchSource.popupComponent
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Processes and highlights a collection of esri graphics into a preset selection graphics layer.
   *
   * If the layer does not exist, it will be created.
   *
   * @param {SelectFeaturesProperties} properties
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
        .then((layer: GraphicsLayer) => {
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
        .then((layer: GraphicsLayer) => {
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
   */
  public clearSelectedFeatures() {
    const source = this.environment.value('LayerSources').find((src) => src.id === 'selection-layer');

    if (source) {
      // Source object
      const layer = Object.assign(source);

      this.findLayerOrCreateFromSource(layer).then((l: GraphicsLayer) => {
        l.removeAll();
      });
    }
  }

  /**
   * Invokes native esri zoomTo map view method using the stored service map and view instances.
   *
   *  Zooms to a collection of graphics at a specified zoom.
   */
  public zoomTo(properties: ZoomProperties) {
    return (<MapView>this._modules.view).goTo({
      target: properties.graphics,
      zoom: properties.zoom
    });
  }

  /**
   * Computes the most appropriate zoom level for a collection of graphics.
   *
   * Calculates the longest edge of the graphic collection envelope and uses that
   * value to determine a best-fit zoom level.
   */
  public computeZoomLevel(graphics: Array<__esri.Graphic>): Promise<number> {
    const geometries: __esri.Geometry[] = graphics.map((graphic) => graphic.geometry);
    const result = geometryEngine.union(geometries);

    if (result.extent) {
      const xMin = result.extent.xmin;
      const xMax = result.extent.xmax;
      const yMin = result.extent.ymin;
      const yMax = result.extent.ymax;

      const xDiff = xMax - xMin;
      const yDiff = yMax - yMin;

      const maximum = Math.max(xDiff, yDiff);

      if (maximum <= 0.0001) {
        return Promise.resolve(20);
      } else if (maximum > 0.0001 && maximum <= 0.004) {
        return Promise.resolve(19);
      } else if (maximum > 0.004 && maximum <= 0.01) {
        return Promise.resolve(17);
      } else {
        return Promise.resolve(undefined);
      }
    } else {
      // Return a default value
      return Promise.resolve(19);
    }
  }
}

export interface MapConfig {
  basemap: MapProperties;
  view: ViewProperties;
}

interface MapProperties extends __esri.MapProperties {
  basemap:
    | BaseMapProperties
    | (
        | 'streets'
        | 'topo'
        | 'satellite'
        | 'hybrid'
        | 'dark-gray'
        | 'gray'
        | 'national-geographic'
        | 'oceans'
        | 'osm'
        | 'terrain'
        | 'dark-gray-vector'
        | 'gray-vector'
        | 'streets-vector'
        | 'streets-night-vector'
        | 'streets-navigation-vector'
        | 'topo-vector'
        | 'streets-relief-fector'
      );
}

export interface BaseMapProperties extends __esri.BasemapProperties {
  baseLayers: [LayerProperties];
}

interface LayerProperties
  extends __esri.LayerProperties,
    __esri.TileLayerProperties,
    __esri.VectorTileLayerProperties,
    __esri.WMSLayerProperties {
  type: string;
}

/**
 * Locally stored esri map and view class instances
 */
export interface MapServiceInstance {
  map: EsriMap;
  view: MapView | SceneView;
}

type NullableMapServiceInstance = Partial<MapServiceInstance>;

/**
 * Defines a graphics collection and any additional options that should be used in the selection.
 *
 * @interface SelectFeaturesProperties
 */
interface SelectFeaturesProperties {
  /**
   * Esri graphic feature array
   */
  graphics: __esri.Graphic[];

  /**
   * If set to true, will open up popup for the first element in the graphics property.
   *
   * Multiple feature popup is not supported yet.
   */
  shouldShowPopup?: boolean;

  /**
   * Assigns an optional popup component override reference if `shouldShowPopup` is true.
   *
   * Cases justifying this property include search result feature selection which default
   * to the selection layer which in turn defaults to a preset component template specific
   * in the environments file. In those cases, specifying a popup component allows proper
   * or conditional rendering.
   */
  popupComponent?: Type<Component>;
}

interface ZoomProperties {
  graphics: __esri.Graphic[];
  zoom?: number;
}

export interface HitTestSnapshot {
  graphics: __esri.Graphic[];

  /**
   * Cases justifying this property include search result feature selection which default
   * to the selection layer which in turn defaults to a preset component template specific
   * in the environments file. In those cases, specifying a popup component allows proper or
   *  conditional rendering.
   */
  popupComponent?: Type<Component>;
}

export interface MapViewProperties {
  /**
   * Describes the mapping mode as a map view (2d)
   *
   */
  mode: '2d';

  /**
   * Native ArcGIS JS MapView Properties
   */
  properties: __esri.MapViewProperties;
}

export interface SceneViewProperties {
  /**
   * Describes the mapping mode as a scene view (3d).
   */
  mode: '3d';

  /**
   * Native ArcGIS JS SceneView Properties
   */
  properties: __esri.SceneViewProperties;
}

export type ViewProperties = MapViewProperties | SceneViewProperties;

export interface IResolveUnloadedLayersProperties {
  layers: Array<IPortalLayer>;
  source: LayerSource;
}
