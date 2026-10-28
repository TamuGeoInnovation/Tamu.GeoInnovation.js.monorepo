import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, lastValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import {
  AutocastableLayer,
  cleanPortalJSONLayer,
  getGeometryType,
  getLayerTypeFromPortalJSON,
  IPortalLayer
} from '@tamu-gisc/common/utils/geometry/esri';
import { LayerLegendOverride, LayerSource, IRemoteLayerService, GroupLayerSourceProperties } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { EsriModuleProviderService } from '../module-provider/module-provider.service';
import { LayerSourcesService } from '../layer-sources/layer-sources.service';
import { registerMapProbe } from './map-probe';
import { orderHitsForPopup, SELECTION_LAYER_ID } from './hit-order';
import { keepSelectionLayerOnTop } from './selection-layer';
import { PopupComponentReference } from '../../popup-reference';
import {
  declaresOwnRenderer,
  PortalItemData,
  missingRendererFields,
  portalItemDataUrl,
  recordSymbologySource,
  rendererFieldsPresent,
  rendererForLayer,
  serviceClassRenderer
} from './portal-symbology';
import { applyStyleLayerChanges, BaseLayerConstructors, makeBaseLayer, StyleLayerChanges } from './basemap-layers';

import esri = __esri;

@Injectable({ providedIn: 'root' })
export class EsriMapService {
  private moduleProvider = inject(EsriModuleProviderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private environment = inject(EnvironmentService);
  private http = inject(HttpClient);
  private layerSourcesService = inject(LayerSourcesService);

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

  /** The component holding the map's `<arcgis-map>`, and its `<arcgis-scene>` once there is one. */
  private _host: MapHost;

  private _viewClickHandle: IHandle;

  /** Whether the map loads the main map's layer set. See `withoutMainLayers`. */
  private _mainLayers = true;

  /**
   * One in-flight or settled request per portal item, keyed by item id, so layers sharing an item
   * share a request rather than racing (#1497).
   */
  private _portalItemData = new Map<string, Promise<PortalItemData | null>>();

  /**
   * The layers being made and not yet on the map, keyed by source id, so two callers asking for the same
   * layer at once get one layer rather than two (#1849). See `findLayerOrCreateFromSource`.
   */
  private _creating = new Map<string, Promise<esri.Layer | Array<esri.Layer>>>();

  public hitTest: Observable<HitTestSnapshot> = this._hitTest.asObservable();

  // Exposed observable that will be responsible for emitting values to subscribers
  public readonly store: Observable<MapServiceInstance> = this._store.asObservable().pipe(filter((s) => s !== undefined));

  constructor() {
    // Keep the automated-test probe pointed at this instance. Subscribed to the private subject
    // rather than the public `store`, because the probe needs the `undefined` emission on destroy
    // too, and `store` filters those out.
    //
    // Done here rather than at each `_store.next` call so a future emission point cannot forget it.
    this._store.subscribe((instance) => registerMapProbe(instance, this));
  }

  /**
   * Whether `useView` selects the feature a link names (`?lot=`, `?bldg=`) itself, from the application's
   * search sources, once the map's layers are added.
   *
   * An event map turns it off: its `EventService` asks the map's own layers first and calls
   * `selectFeaturesFromUrl` only when none of them has the feature. Left on there, both selected and the
   * last answer won, so a `?lot=` link on Visitor Parking opened the main map's Lot 100j whenever the map's
   * own service was slow (#1969).
   */
  public selectsFeaturesFromUrlOnLoad = true;

  /**
   * Makes the map a page's `<arcgis-map>` shows, from the page's basemap description (#1949).
   *
   * The view is the element's own, made by `EsriMapComponent` with this map, and handed back with `useView`.
   */
  public async makeMap(mapProperties: MapProperties): Promise<esri.Map> {
    const [Map, TileLayer, VectorTileLayer, WMSLayer, Basemap, FeatureLayer]: [
      typeof esri.Map,
      typeof esri.TileLayer,
      typeof esri.VectorTileLayer,
      typeof esri.WMSLayer,
      typeof esri.Basemap,
      typeof esri.FeatureLayer
    ] = await this.moduleProvider.require(['Map', 'TileLayer', 'VectorTileLayer', 'WMSLayer', 'Basemap', 'FeatureLayer']);

    const basemap = this.makeBasemap(mapProperties, { TileLayer, VectorTileLayer, WMSLayer, FeatureLayer }, Basemap);

    this._modules.map = new Map(basemap);
    keepSelectionLayerOnTop(this._modules.map);

    return this._modules.map;
  }

  /**
   * Takes the view a page's `<arcgis-map>` made for the map from `makeMap`, and loads the map's layers
   * into it. `host` is the component holding the element, which also draws the 3D scene when one is asked
   * for (`sceneView`) and shows whichever view `setView` makes current.
   */
  public async useView(view: esri.MapView, host: MapHost): Promise<void> {
    this._host = host;
    this._modules.view = view;

    // Set the value of the async subject
    this._store.next({
      map: this._modules.map,
      view: this._modules.view
    });

    const layerSources: Array<LayerSource> = this.filterLayerSources(null, { params: true });

    // Filter list of layers that need to be added on map load
    await this.loadLayers(layerSources);

    // Load feature list from url (e.g. howdy links), unless the map's host resolves links itself.
    if (this.selectsFeaturesFromUrlOnLoad) {
      this.selectFeaturesFromUrl();
    }

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
   * The map's 3D scene, an `<arcgis-scene>` beside its `<arcgis-map>`, made the first time it is asked for
   * with `properties`. Shown, with the map, by `setView`.
   */
  public sceneView(properties: esri.SceneViewProperties): Promise<esri.SceneView> {
    return this._host.sceneView(properties);
  }

  /**
   * Makes `view` the map's view, in place of the current one.
   *
   * `place` is where the incoming view should look. Without it the outgoing view's own viewpoint is
   * copied, which is right between two views of the same kind and wrong out of a tilted 3D scene: that
   * viewpoint describes the scene's camera, and a 2D view given it centres on where the camera was
   * standing, not on what it was looking at (#1724). A caller that changes perspective says where.
   *
   * `between` runs once the outgoing view has let go of the map and before the incoming one takes
   * it: the moment to change something neither view could have shown the other's version of, such
   * as a basemap a 3D scene cannot draw (#1735).
   */
  public setView(view: esri.SceneView | esri.MapView, place?: esri.ViewpointProperties, between?: (map: esri.Map) => void) {
    this.destroyViewClickEventHandler();

    // Carry the current camera/extent across the swap. Disconnecting and reconnecting the map below
    // otherwise resets the camera to a default extent, where the campus-only basemap (minScale 100000)
    // and the buildings render nothing and the canvas looks blank.
    const viewpoint = place ?? this._modules.view?.viewpoint?.clone();

    // Detach the outgoing view from the shared map. A view that keeps the map stays subscribed to its
    // layers, so the hidden 2D MapView kept trying to build layer views, and when the 3D-only SceneLayer
    // (3D Buildings) was added after the swap, choked resolving it ("Cannot read properties of null
    // (objectIdField)"), throwing an uncaught rejection into Angular and blanking the canvas. Detaching the
    // map leaves only the shown view processing layers.
    if (this._modules.view) {
      (this._modules.view as { map: esri.Map | null }).map = null;
    }

    // Reconnect the incoming view to the shared map (it may have been disconnected on a previous
    // swap), restore the camera, and show it in place of the outgoing one.
    this._modules.view = view;
    if (this._modules.map) {
      between?.(this._modules.map);
      this._modules.view.map = this._modules.map;
    }
    if (viewpoint) {
      this._modules.view.viewpoint = viewpoint as esri.Viewpoint;
    }
    this._host.show(view);

    this._store.next({ ...this._store.getValue(), view: this._modules.view });

    this.registerViewClickEventHandler();
  }

  private registerViewClickEventHandler() {
    // Set up a hit test wrapper that can be subscribed to anywhere in the application.
    this._viewClickHandle = this._modules.view.on('click', (e) => {
      this._modules.view.hitTest(e).then((res: esri.HitTestResult) => {
        // Clear the hit test object regardless of router state
        this.clearHitTest();

        // Only set the hit test value if the current app route is not trip.
        // This is because we don't want to shop popup when trying to click
        // on map to set route which will overlay on top of trip planner controls
        if (!this.router.url.includes('trip')) {
          // A hit can also be a media or route hit, which carries no graphic (ArcGIS 4.27, #1322).
          this._hitTest.next({
            graphics: orderHitsForPopup(
              res.results.filter((r): r is esri.GraphicHit => r.type === 'graphic').map((r) => r.graphic)
            )
          });
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
  private makeBasemap(mapProperties, layers: BaseLayerConstructors, Basemap: typeof esri.Basemap): esri.MapProperties {
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
      mProps.basemap.baseLayers = mProps.basemap.baseLayers.map((l) => makeBaseLayer(l, layers));

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
   */
  public async loadLayers(sources: LayerSource[]) {
    await this.registerIdentityAuthInfos(sources);

    // Index legend overrides from dynamically-loaded sources (e.g. event layers loaded outside
    // the env-initialized LayerSources list) so the legend component can resolve them by id.
    this.layerSourcesService.collectLegendOverrides(sources);

    for (const source of sources) {
      await this.findLayerOrCreateFromSource(source);
    }
  }

  public async generateLayer(source: LayerSource | AutocastableLayer): Promise<esri.Layer | Array<esri.Layer>> {
    // Object with merged root level properties, native properties, and persistent properties.
    let props;

    // Check if the incoming source has the native property because Autocastable layers do not.
    if ('native' in source) {
      props = { ...source, ...(source as LayerSource).native };
    } else {
      props = { ...source };
    }

    // Capture the legend override before it gets stripped - the same sizing hints are applied
    // to the on-map picture-marker symbols once the layer loads.
    const legendOverride = (source as LayerSource).legend;

    // Remove the 'native' property from the object since it's not needed in the layer creation.
    if ('native' in props) {
      delete props.native;
    }

    // Strip the legend override before constructing the esri layer. It's only consumed by the
    // legend component (via LayerSourcesService.getLegendOverride) and ArcGIS will reject or
    // misinterpret an unknown `legend` property on the layer constructor.
    if ('legend' in props) {
      delete props.legend;
    }

    // Read by applyPortalItemSymbology once the layer loads; not a property ArcGIS knows.
    if ('symbolFromServiceClass' in props) {
      delete props.symbolFromServiceClass;
    }

    // Delete any additional properties to avoid polluting layer instances
    if ('loadOnInit' in props) {
      delete props.loadOnInit;
    }

    if (source.type === 'feature') {
      return this.moduleProvider.require(['FeatureLayer']).then(([FeatureLayer]: [typeof esri.FeatureLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new feature layer
        const layer = new FeatureLayer(props as esri.FeatureLayerProperties);
        recordSymbologySource(layer, declaresOwnRenderer(source) ? 'own' : 'service');
        this.applyLegendOverrideToLayerSymbols(layer, legendOverride);
        this.applyPortalItemSymbology(layer, source);
        this.applyServiceLayerName(layer, (props as { title?: unknown }).title);
        return layer;
      });
    } else if (source.type === 'map-image') {
      return this.moduleProvider.require(['MapImageLayer']).then(([ImageLayer]: [typeof esri.MapImageLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new map image layer
        return new ImageLayer(props as esri.MapImageLayerProperties);
      });
    } else if (source.type === 'scene') {
      return this.moduleProvider.require(['SceneLayer']).then(([SceneLayer]: [typeof esri.SceneLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new scene layer
        return new SceneLayer(props as esri.SceneViewProperties);
      });
    } else if (source.type === 'graphics') {
      return this.moduleProvider.require(['GraphicsLayer']).then(([GraphicsLayer]: [typeof esri.GraphicsLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new graphics layer
        return new GraphicsLayer(props as esri.GraphicsLayerProperties);
      });
    } else if (source.type === 'geojson') {
      return this.moduleProvider.require(['GeoJSONLayer']).then(([GeoJSONLayer]: [typeof esri.GeoJSONLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new geojson layer
        const layer = new GeoJSONLayer(props as esri.GeoJSONLayerProperties);
        recordSymbologySource(layer, declaresOwnRenderer(source) ? 'own' : 'none');
        return layer;
      });
    } else if (source.type === 'vector-tile') {
      return this.moduleProvider
        .require(['VectorTileLayer'])
        .then(([VectorTileLayer]: [typeof esri.VectorTileLayer]) => {
          // Delete the type property as it cannot be set on layer creation, and take out the style layers to
          // hide, which are ours rather than Esri's (#2459).
          delete props.type;
          const { hiddenStyleLayers, ...rest } = props as StyleLayerChanges & Record<string, unknown>;

          const layer = new VectorTileLayer(rest as esri.VectorTileLayerProperties);
          applyStyleLayerChanges(layer, { hiddenStyleLayers });
          return layer;
        });
    } else if (source.type === 'csv') {
      return this.moduleProvider.require(['CSVLayer']).then(([CSVLayer]: [typeof esri.CSVLayer]) => {
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // Create and return new csv layer
        const layer = new CSVLayer(props as esri.CSVLayerProperties);
        recordSymbologySource(layer, declaresOwnRenderer(source) ? 'own' : 'none');
        return layer;
      });
    } else if (source.type === 'group') {
      return this.moduleProvider.require(['GroupLayer']).then(async ([GroupLayer]: [typeof esri.GroupLayer]) => {
        const s: GroupLayerSourceProperties = source;
        // Delete the type property as it cannot be set on layer creation.
        delete props.type;

        // `listHeading` is not an esri property, so strip it before construction and set it on the
        // layer afterwards for the layer list to read. A heading has no toggle, so it must stay visible
        // or its children could never draw.
        const listHeading = s.listHeading === true;
        delete props.listHeading;

        if (listHeading) {
          props.visible = true;
        }

        let group: esri.GroupLayer;

        // If sources have been defined in the layer source, cast them into their respective layer types.
        if (s.sources) {
          const layerPromises = s.sources.map((ls) => this.generateLayer(ls));

          const layers = await Promise.all(layerPromises);

          // Create and return new group layer
          group = new GroupLayer({ ...props, layers: layers } as esri.GroupLayerProperties);
        } else {
          // Create and return new group layer
          group = new GroupLayer(props as esri.GroupLayerProperties);
        }

        if (listHeading) {
          group['listHeading'] = true;
        }

        return group;
      });
    } else if (source.type === 'unknown') {
      return this.moduleProvider.require(['Layer']).then(async ([L]: [typeof esri.Layer]) => {
        return L.fromArcGISServerUrl({
          url: source.url
        }).then((l) => {
          delete props.type;

          return Object.assign(l, props);
        });
      });
    } else if (source.type === 'map-server') {
      if (source.auth) {
        // Identity manager should have AuthInfos registered to it at this point. Query the identity manager
        // to fetch the associated access token to make a raw GET request for the layer's JSON source.
        return this.moduleProvider
          .require(['IdentityManager'])
          .then(([IdentityManager]: [esri.IdentityManager]) => {
            return IdentityManager.getCredential(
              source.auth.overrideCredentialUrl ? source.auth.overrideCredentialUrl : source.auth.info.portalUrl
            );
          })
          .then((cred) => {
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
  public findLayerOrCreateFromSource(source: LayerSource): Promise<esri.Layer | Array<esri.Layer>> {
    const map: esri.Map = this._modules.map;

    if (this.layerExists(source.id)) {
      return new Promise((r, rj) => {
        try {
          r(map.findLayerById(source.id));
        } catch (err) {
          rj(err);
        }
      });
    }

    // A layer is only on the map once it has been made, which takes at least one await. A second caller
    // in that window used to make and add a second layer with the same id: the main map's set and a
    // Football Tailgating `?tent=` link each added a selection layer, the highlight went on one of them,
    // and the other, empty one could be the one on top (#1849). The second caller now waits for the first.
    const pending = this._creating.get(source.id);

    if (pending) {
      return pending;
    }

    // Generate the layer
    const created = this.generateLayer(source)
      .then((layerOrLayers) => {
        if (layerOrLayers instanceof Array) {
          // Add layer to map
          (<esri.Map>this._modules.map).addMany(layerOrLayers, source.layerIndex ?? undefined);
        } else {
          // Add layer to map
          (<esri.Map>this._modules.map).add(layerOrLayers, source.layerIndex ?? undefined);
        }

        // Return layer in case further manipulation is needed.
        return layerOrLayers;
      })
      .finally(() => this._creating.delete(source.id));

    this._creating.set(source.id, created);

    return created;
  }

  public async resolveUnloadedLayers(args: IResolveUnloadedLayersProperties): Promise<Array<esri.Layer>> {
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
   * Applies the `legend` override's sizing hints (`width` / `height`) to the on-map picture-marker
   * symbols of the supplied layer once it has loaded. This keeps the map icon and the legend
   * swatch visually consistent - without this, a `legend.width` of 24 would only shrink the legend
   * swatch while the map would keep the larger service-defined dimensions.
   *
   * Only picture-marker symbols are touched; non-image symbols (simple-fill, simple-line, …) are
   * left alone because they don't have a meaningful width/height in the same sense.
   */
  /**
   * Draws a hosted layer with the symbology its portal item publishes (#1497).
   *
   * A layer authored in ArcGIS Pro keeps its symbol on the portal item; the service definition
   * carries a flattened approximation, and loading by service URL - which every map here does - gets
   * the flattened one. Measured across the 36 hosted services on 6 October 2026: of 128 layers, 128
   * publish CIM symbology on their item and none on their service. `portal-symbology.ts` has the
   * detail and the worked example (#1496).
   *
   * A map that set its own renderer keeps it: Construction deliberately replaces the service's
   * per-owner colours with one orange hatch. This only fills in where nothing was chosen.
   *
   * A layer source naming `symbolFromServiceClass` draws every feature with that class's symbol, from the
   * portal item or, without one, the service: for a renderer whose values have gone stale (#1992).
   *
   * Everything here fails quietly on purpose. A portal that cannot be reached, an item that is not
   * shared, a layer the item does not describe - none of those are reasons to stop a map drawing. The
   * layer keeps the service's symbology, which is what it had before this existed.
   */
  private applyPortalItemSymbology(layer: esri.FeatureLayer, source: LayerSource | AutocastableLayer): void {
    if (declaresOwnRenderer(source)) {
      return;
    }

    layer
      .when()
      .then(async () => {
        // `sourceJSON` is the service's own description of the layer, which is where the item id is.
        const itemId = (layer as unknown as { sourceJSON?: { serviceItemId?: string } }).sourceJSON?.serviceItemId;
        const url = itemId ? portalItemDataUrl(layer.url ?? '', itemId) : null;

        const itemRenderer = url && itemId ? rendererForLayer(await this.portalItemData(itemId, url), layer.layerId) : null;

        // An item is not republished with its service, so its renderer can key on fields the layer has lost (#2500).
        const fieldNames = (layer.fields ?? []).map((field) => field.name);
        const portal = itemRenderer && rendererFieldsPresent(itemRenderer, fieldNames) ? itemRenderer : null;

        if (itemRenderer && !portal) {
          console.warn(
            `Layer '${layer.title}' keeps its service's symbology: its portal item's renderer keys on fields the layer does not have (${missingRendererFields(itemRenderer, fieldNames).join(', ')}).`
          );
        }

        // A class named by the definition draws every feature, because the renderer's values are stale.
        const serviceClass = (source as LayerSource).symbolFromServiceClass;
        const renderer = serviceClass
          ? serviceClassRenderer(portal ?? layer.renderer?.toJSON(), serviceClass) ?? portal
          : portal;

        if (!renderer) {
          return;
        }

        const [rendererJsonUtils] = await this.moduleProvider.require(['rendererJsonUtils']);

        layer.renderer = rendererJsonUtils.fromJSON(renderer);
        recordSymbologySource(layer, portal ? 'portal' : 'service');
      })
      .catch(() => {
        // See above: a layer that draws its service's symbology is the previous behaviour, not a fault.
      });
  }

  /**
   * An untitled feature layer is named by its own name in the service (#1802).
   *
   * #1526 took the titles out of the definitions so that names would come from the services. But a
   * layer loaded by URL with no title is named by ArcGIS "<service name> - <layer name>", and our
   * services are the hosted `*_view` ones, so Aggie Family Parade's route read "Aggie Family Parade
   * view - Parade Route". `sourceJSON.name` is the layer's name as its service publishes it.
   *
   * A title the definition chose is left alone, and a layer that fails to load keeps ArcGIS's title.
   */
  private applyServiceLayerName(layer: esri.FeatureLayer, title: unknown): void {
    if (title) {
      return;
    }

    layer
      .when()
      .then(() => {
        const name = (layer as unknown as { sourceJSON?: { name?: string } }).sourceJSON?.name;

        if (name) {
          layer.title = name;
        }
      })
      .catch(() => {
        // Nothing loaded, so there is no name to take; the load failure is reported where it happens.
      });
  }

  /**
   * One portal item's data, fetched once however many layers come from it.
   *
   * The 128 layers measured in #1497 come from 36 items, so without this the same document would be
   * fetched three or four times over on a busy map. The promise is cached rather than the result, so
   * layers loading together share one request instead of racing.
   */
  private portalItemData(itemId: string, url: string): Promise<PortalItemData | null> {
    const existing = this._portalItemData.get(itemId);

    if (existing) {
      return existing;
    }

    const request = lastValueFrom(this.http.get<PortalItemData>(url))
      .then((data) => ((data as unknown as { error?: unknown })?.error ? null : data))
      .catch(() => null);

    this._portalItemData.set(itemId, request);

    return request;
  }

  private applyLegendOverrideToLayerSymbols(layer: esri.FeatureLayer, override: LayerLegendOverride | undefined): void {
    if (!override) {
      return;
    }

    const { width, height } = override;
    if (width === undefined && height === undefined) {
      return;
    }

    const applyToSymbol = (symbol: unknown): void => {
      if (!symbol || (symbol as { type?: string }).type !== 'picture-marker') {
        return;
      }

      const target = symbol as { width?: number; height?: number };
      if (width !== undefined) {
        target.width = width;
      }
      if (height !== undefined) {
        target.height = height;
      }
    };

    const applyToRenderer = (renderer: esri.Renderer | undefined | null): void => {
      if (!renderer) {
        return;
      }

      if (renderer.type === 'simple') {
        applyToSymbol((renderer as esri.SimpleRenderer).symbol);
      } else if (renderer.type === 'unique-value') {
        const unique = renderer as esri.UniqueValueRenderer;
        unique.uniqueValueInfos?.forEach((info) => applyToSymbol(info.symbol));
        applyToSymbol(unique.defaultSymbol);
      } else if (renderer.type === 'class-breaks') {
        const classBreaks = renderer as esri.ClassBreaksRenderer;
        classBreaks.classBreakInfos?.forEach((info) => applyToSymbol(info.symbol));
        applyToSymbol(classBreaks.defaultSymbol);
      }
    };

    // The renderer is typically populated by the service after the layer loads. Apply to the one it
    // has now, and again any time it is set: when the layer loads, and on any later reassignment.
    this.moduleProvider.require(['reactiveUtils']).then(([reactiveUtils]: [esri.reactiveUtils]) => {
      reactiveUtils.watch(() => layer.renderer, applyToRenderer, { initial: true });
    });
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
      return this.moduleProvider
        .require(['IdentityManager', 'OAuthInfo'])
        .then(([IdentityManager, OAuthInfo]: [esri.IdentityManager, typeof esri.OAuthInfo]) => {
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
        });
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

      (inverted as unknown as esri.GroupLayerProperties).layers = layers;

      return inverted;
    }

    return parent.resolvedLayer;
  }

  /**
   * Service wrapper for the findLayerById map class method.
   *
   * @param {string} id Layer id reference
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
   * Removes a list of layers by ID. Ignores invalid layer ID's.
   */
  public removeLayersById(ids: Array<string>): void {
    const map = this._modules.map;

    const layers = ids.map((lid) => map.findLayerById(lid)).filter((layer) => layer !== undefined);

    map.removeMany(layers);
  }

  public removeLayerById(id: string): void {
    const map: esri.Map = this._modules.map;
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
    const map: esri.Map = this._modules.map;
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
   * Builds the map without the main map's layer set (the environment's `LayerSources`), so it draws
   * only the layers its caller adds. Call before the map loads.
   *
   * For kiosk maps, which show exactly what their own definition says. Loading the main set as well
   * drew campus layers a kiosk has no use for, and let the main map's copy of a layer the kiosk also
   * defines race the kiosk's own: the dining kiosk drew no dining on most loads (#1392).
   *
   * The service is scoped to its map component, so this cannot reach another map.
   */
  public withoutMainLayers(): void {
    this._mainLayers = false;
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
    if (!sources && !this._mainLayers) {
      return [];
    }

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
      .search<esri.Graphic>({
        returnObservable: true,
        sources: repeatedDataset,
        values: extractionResult.identifiersList
      })
      .subscribe((queryResults) => {
        const validGraphics = queryResults.results.reduce((collection, resultItem) => {
          if (resultItem.features?.length) {
            const primaryGraphic = resultItem.features[0];
            const clonedGraphic = { ...primaryGraphic } as esri.Graphic;
            (<{ type: unknown }>clonedGraphic.geometry).type = getGeometryType(primaryGraphic.geometry);
            collection.push(clonedGraphic);
          }
          return collection;
        }, [] as esri.Graphic[]);

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
  public getFeatureListFromURL(): {
    dataset: string;
    identifiersList: (string | number)[];
    popupComponent?: PopupComponentReference;
  } | null {
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
      const matchedParam = paramsToCheck.find((param) => queryParameters[param]);

      if (matchedParam) {
        const parameterValue = queryParameters[matchedParam];

        if (parameterValue?.trim()) {
          // Numeric-field sources (e.g. OBJECTID) must pass unquoted values; strict MapServer layers
          // reject a quoted integer. String sources are left as-is.
          const tokens = parameterValue
            .split(',')
            .map((token) => (searchSource.urlQueryParamNumeric ? Number(token) : token));
          const deduplicatedTokens = tokens.reduce(
            (uniqueList, token) => {
              if (!uniqueList.includes(token)) {
                uniqueList.push(token);
              }
              return uniqueList;
            },
            [] as (string | number)[]
          );

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
    const requestedZoom = properties.zoom;

    // Source object
    const selectionLayers = this.environment.value('LayerSources') as LayerSource[];
    const source = Object.assign(selectionLayers.find((src) => src.id === SELECTION_LAYER_ID)) as LayerSource;

    // Add the symbol and polygon type to each feature
    const features = graphics.map((ft) => {
      const feature = ft;
      feature.symbol = this.environment.value('SelectionSymbols')[ft.geometry.type];

      return feature;
    });

    // Made here if the map has not made it yet. Either way it gets this selection's graphics, so a caller
    // that is making it at the same moment cannot leave it empty (#1849).
    this.findLayerOrCreateFromSource(source)
      .then((layerOrLayers) => {
        const layer = layerOrLayers as esri.GraphicsLayer;
        layer.removeAll();
        layer.addMany(features);

        if (shouldShowPopup) {
          this._hitTest.next({ graphics: graphics, popupComponent: properties.popupComponent });
        }

        return layer.graphics.toArray();
      })
      .then((grfx) => {
        const zoomPromise = requestedZoom !== undefined ? Promise.resolve(requestedZoom) : this.computeZoomLevel(grfx);

        zoomPromise.then((zoom) => {
          this.zoomTo({
            graphics: grfx,
            zoom: zoom
          });
        });
      });
  }

  /**
   * Clears all graphics from the selection layer
   *
   */
  public clearSelectedFeatures() {
    const source = this.environment.value('LayerSources').find((src) => src.id === SELECTION_LAYER_ID);

    if (source) {
      // Source object
      const layer = Object.assign(source);

      this.findLayerOrCreateFromSource(layer).then((l: esri.GraphicsLayer) => {
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
    const view = <esri.MapView>this._modules.view;

    if (properties.zoom !== undefined) {
      return view.goTo({ target: properties.graphics, zoom: properties.zoom });
    }

    return view.goTo(properties.graphics);
  }

  /**
   * Computes the most appropriate zoom level for a collection of graphics.
   *
   * Calculates the longest edge of the graphic collection envelope and uses that
   * value to determine a best-fit zoom level.
   */
  public computeZoomLevel(graphics: Array<esri.Graphic>): Promise<number> {
    return this.moduleProvider.require(['unionOperator']).then(([unionOperator]: [esri.unionOperator]) => {
      const result = unionOperator.executeMany(graphics.map((graphic) => graphic.geometry));

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
  view: ViewProperties;
}

interface MapProperties extends Omit<esri.MapProperties, 'basemap'> {
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

export interface BaseMapProperties extends Omit<esri.BasemapProperties, 'baseLayers'> {
  /** More than one where a basemap draws something over its tiles (#2459). It was a one-element tuple. */
  baseLayers: Array<LayerProperties>;
}

interface LayerProperties
  extends esri.LayerProperties, esri.TileLayerProperties, esri.VectorTileLayerProperties, esri.WMSLayerProperties {
  type: string;
  /** A VectorTileLayer's style layers to turn off once its style loads, by id (#2459). */
  hiddenStyleLayers?: StyleLayerChanges['hiddenStyleLayers'];
  /** A FeatureLayer's, for one drawn as part of a basemap (#2459). */
  definitionExpression?: esri.FeatureLayerProperties['definitionExpression'];
  renderer?: esri.FeatureLayerProperties['renderer'];
  popupEnabled?: esri.FeatureLayerProperties['popupEnabled'];
}

/**
 * Locally stored esri map and view class instances
 */
export interface MapServiceInstance {
  map: esri.Map;
  view: esri.MapView | esri.SceneView;
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
  graphics: esri.Graphic[];

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
  popupComponent?: PopupComponentReference;

  /**
   * Optional explicit zoom level to use instead of computing one from geometry extent.
   */
  zoom?: number;
}

interface ZoomProperties {
  graphics: esri.Graphic[];
  zoom?: number;
}

export interface HitTestSnapshot {
  graphics: esri.Graphic[];

  /**
   * Cases justifying this property include search result feature selection which default
   * to the selection layer which in turn defaults to a preset component template specific
   * in the environments file. In those cases, specifying a popup component allows proper or
   *  conditional rendering.
   */
  popupComponent?: PopupComponentReference;
}

export interface ViewProperties {
  /**
   * The view's properties, set on the page's `<arcgis-map>` before its view loads (#1949). Each is one
   * the element takes; it makes its own container and is given the map.
   */
  properties: esri.MapViewProperties;
}

/** The component that holds a map's elements; see `EsriMapService.useView`. */
export interface MapHost {
  sceneView(properties: esri.SceneViewProperties): Promise<esri.SceneView>;
  show(view: esri.MapView | esri.SceneView): void;
}

export interface IResolveUnloadedLayersProperties {
  layers: Array<IPortalLayer>;
  source: LayerSource;
}
