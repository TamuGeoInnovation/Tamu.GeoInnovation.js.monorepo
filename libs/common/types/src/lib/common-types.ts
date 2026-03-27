

/**
 * Basic representation of a geographic point with longitude (x) and latitude(y) values
 *
 * @export
 */
export interface Point {
  latitude: number;
  longitude: number;
}

//
// Base Symbol Typings
//
interface CIMSymbol {
  type: 'cim' & __esri.CIMSymbolProperties;
}

type SimpleFillSymbol = { type: 'simple-fill' } & __esri.SimpleFillSymbolProperties;

type PictureFillSymbol = { type: 'picture-fill' } & __esri.PictureFillSymbolProperties;

type SimpleLineSymbol = { type: 'simple-line' } & __esri.SimpleLineSymbolProperties;

type SimpleMarkerSymbol = { type: 'simple-marker' } & __esri.SimpleMarkerSymbolProperties;

type PictureMarkerSymbol = { type: 'picture-marker' } & __esri.PictureMarkerSymbolProperties;

type Point3DSymbol = { type: 'point-3d' } & __esri.PointSymbol3DProperties;

type Line3DSymbol = { type: 'line-3d' } & __esri.LineSymbol3DProperties;

type Polygon3DSymbol = { type: 'polygon-3d' } & __esri.PolygonSymbol3DProperties;

type Mesh3DSymbol = { type: 'mesh-3d' } & __esri.MeshSymbol3DProperties;

type Label3DSymbol = { type: 'label-3d' } & __esri.LabelSymbol3DProperties;

type TextSymbol = { type: 'text' } & __esri.TextSymbolProperties;

type WebStyleSymbol = { type: 'web-style' } & __esri.WebStyleSymbolProperties;

//
// Autocasting Symbol Typings
//
interface FillSymbolAutoCastOptions {
  symbol: (SimpleFillSymbol & __esri.SimpleFillSymbolProperties) | (PictureFillSymbol & __esri.PictureFillSymbolProperties);
}

interface LineSymbolAutoCastOptions {
  symbol: SimpleLineSymbol & __esri.SimpleLineSymbolProperties;
}

interface MarkerSymbolAutoCastOptions {
  symbol:
    | (SimpleMarkerSymbol & __esri.SimpleMarkerSymbolProperties)
    | (PictureMarkerSymbol & __esri.PictureMarkerSymbolProperties);
}

interface Symbol3DAutoCastOptions {
  symbol:
    | (Point3DSymbol & __esri.PointSymbol3DProperties)
    | (Line3DSymbol & __esri.LineSymbol3DProperties)
    | (Polygon3DSymbol & __esri.PolygonSymbol3DProperties)
    | (Mesh3DSymbol & __esri.MeshSymbol3DProperties)
    | (Label3DSymbol & __esri.LabelSymbol3DProperties);
}

interface TextSymbolAutoCastOptions {
  symbol: TextSymbol & __esri.TextSymbolProperties;
}

interface WebStyleSymbolAutoCastOptions {
  symbol: WebStyleSymbol & __esri.WebStyleSymbolProperties;
}

type AutoCastSymbols =
  | CIMSymbol
  | FillSymbolAutoCastOptions
  | LineSymbolAutoCastOptions
  | MarkerSymbolAutoCastOptions
  | Symbol3DAutoCastOptions
  | TextSymbolAutoCastOptions
  | WebStyleSymbolAutoCastOptions;

//
// Renderer Typings
//

/**
 * Auto-castable class break renderer interface inheriting most of the Esri Class Break Renderer properties except some which
 * are overwritten where they support auto-casting.
 */
type ClassBreakRendererNativeOptions = Omit<__esri.ClassBreaksRendererProperties, 'backgroundFillSymbol'> & {
  type: 'class-breaks';
  backgroundFillSymbol?: SimpleFillSymbol | PictureFillSymbol | Polygon3DSymbol;
};

/**
 * Auto-castable dot density renderer interface inheriting most of the Esri Dot Density Renderer properties except some which
 * are overwritten where they support auto-casting.
 */
type DotDensityRendererNativeOptions = Omit<__esri.DotDensityRendererProperties, 'visualVariables'> & {
  type: 'dot-density';
  visualVariables?: __esri.VisualVariableProperties[];
};

/**
 * Auto-castable heatmanp renderer options, inheriting Esri's Heatmap Renderer properties.
 */
type HeatmapRendererNativeOptions = __esri.HeatmapRendererProperties & { type: 'heatmap' };
/**
 * Auto-castable simple renderer interface inheriting most of the Esri Simple Renderer properties except some which
 * are overwritten where they support auto-casting.
 */
type SimpleRendererNativeOptions = Omit<__esri.SimpleRendererProperties, 'symbol'> & {
  type: 'simple';
} & AutoCastSymbols;

/**
 * Auto-castable unique value interface inheriting most of the Esri Unique Value Renderer properties except some which are overwritten
 * where they support auto-casting.
 */
type UniqueValueRendererNativeOptions = Omit<__esri.UniqueValueRendererProperties, 'backgroundFillSymbol'> & {
  type: 'unique-value';
  backgroundFillSymbol?: SimpleFillSymbol | PictureFillSymbol | Polygon3DSymbol;
};

type RendererAutoCastNativeOptions =
  | ClassBreakRendererNativeOptions
  | DotDensityRendererNativeOptions
  | SimpleRendererNativeOptions
  | HeatmapRendererNativeOptions
  | UniqueValueRendererNativeOptions;

export interface IRemoteLayerService {
  /**
   * URL for the layer service
   *
   * If the service contains multiple layers, point to the sub layer that will be added. For example:
   *
   * `http://source.com/to/layer/0`
   */
  url: string;
}

//
// Layer Source Type Typings
//

export interface FeatureLayerSourceProperties extends IRemoteLayerService {
  type: 'feature';

  native?: Omit<__esri.FeatureLayerProperties, 'renderer' | 'labelingInfo'> & {
    labelingInfo?: ({ symbol?: TextSymbol | Label3DSymbol } & Omit<__esri.LabelClassProperties, 'symbol'>)[];
    renderer?: RendererAutoCastNativeOptions;
  };
}

export interface SceneLayerSourceProperties extends IRemoteLayerService {
  type: 'scene';

  native?: Omit<__esri.SceneLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

export interface GeoJSONLayerSourceProperties extends IRemoteLayerService {
  type: 'geojson';

  native?: Omit<__esri.GeoJSONLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

export interface MapImageLayerSourceProperties extends IRemoteLayerService {
  type: 'map-image';

  native?: __esri.MapImageLayerProperties;
}

export interface CSVLayerSourceProperties extends IRemoteLayerService {
  type: 'csv';

  native?: Omit<__esri.CSVLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

export interface GraphicLayerSourceProperties {
  type: 'graphics';

  /**
   * Graphics used in the creation of the layer
   */
  graphics?: __esri.Graphic[];
  native?: __esri.GraphicsLayerProperties;
}

export interface GroupLayerSourceProperties {
  type: 'group';

  /**
   * Collection of layer sources that will be casted into their respective layer types and added to the
   * group layer construction.
   */
  sources?: LayerSource[];

  /**
   * Native group layer properties.
   */
  native?: __esri.GroupLayerProperties;
}

interface PortalMapServerLayerSourceProperties {
  type: 'map-server';

  /**
   * Portal service base URL. The schema for the service will be pulled and all layers contained in the definition
   * will be loaded.
   *
   * Example: https://service.domain/arcgis/rest/services/Folder/Folder/MapServer
   */
  url: string;

  native?: {
    /**
     * Default group layer properties appended to all group layers found in the service.
     */
    defaultGroupLayerProperties?: __esri.GroupLayerProperties;

    /**
     * Default feature layer properties appended to all feature layers found in the service.
     */
    defaultFeatureLayerProperties?: __esri.FeatureLayerProperties & { popupComponent?: unknown };
  };
}

/**
 * Represents an statically unknown layer source type. The casted layer type will be determined by
 * the API since this layer source is resolved using `Layer.fromArcGISServerUrl`.
 */
interface UnknownLayerSourceProperties {
  type: 'unknown';

  /**
   * Portal service base URL. The schema for the service will be pulled and all layers contained in the definition
   * will be loaded.
   *
   * Example: https://service.domain/arcgis/rest/services/Folder/Folder/MapServer
   */
  url: string;

  native?: { [key: string]: boolean | number | string };
}

export type LayerSourceType =
  | FeatureLayerSourceProperties
  | SceneLayerSourceProperties
  | GeoJSONLayerSourceProperties
  | CSVLayerSourceProperties
  | GraphicLayerSourceProperties
  | GroupLayerSourceProperties
  | MapImageLayerSourceProperties
  | PortalMapServerLayerSourceProperties
  | UnknownLayerSourceProperties;

/**
 * Describes the properties for each layer source used by a layer factory to add layers to the map as required.
 */
export type LayerSource = LayerSourceType & {
  /**
   * Unique value used to reference a particular layer source.
   *
   * Value will also be used as the internal layer id.
   */
  id: string;

  /**
   * Display value used for UI representation.
   */
  title: string;

  /**
   * Determines whether the layer will be listed by the layer component.
   *
   * Defaults to `'show'`
   */
  listMode?: 'show' | 'hide';

  /**
   * Determines whether the layer will be loaded on application load.
   *
   * A layer can be listed as "show" but not load on init. This will enable layer lazy-loading,
   * meaning layers will only load when requested.
   *
   * Defaults to `true`
   *
   * @deprecated Property has no function since implementation of esri's LayerListViewModel.
   *
   * Prefer the use of the `visible` property to control the initial visibility of the layer.
   * Do note that layer visibility still ads the layer to the map, but it will not be rendered until the layer is visible.
   * There is no support for lazy loading layers at the moment.
   */
  loadOnInit?: boolean;

  /**
   * Current visible state for a layer.
   *
   * Will default to true;
   */
  visible?: boolean;

  /**
   * Determines whether this layer is essential and should always be added to the map,
   * regardless of specific layer requests or filtering.
   *
   * Essential layers are typically foundational layers like base buildings, roads,
   * or other infrastructure that provide necessary context for the map.
   *
   * If layer visibility is set to `false`, it will be overridden in favor of `true`
   *
   * Defaults to `false`
   */
  essential?: boolean;

  /**
   * Template that is shows when a feature from this layer is selected.
   *
   * If a template is not provided, a popup will not be shown.
   */
  popupTemplate?: __esri.PopupTemplateProperties;

  popupComponent?: unknown;

  /**
   * Object with dot notation keys that will be used to populate the popup template.
   *
   * If the feature selected contains the same keys, they will be overwritten in favor of the defined popupData.
   */
  popupData?: Record<
    string,
    | string
    | {
        /**
         * Key used to reference the value in the feature attributes.
         */
        field: string;

        /**
         * Describes if the `field` is a flat property or a nested property.
         *
         * Some objects carry key paths with dot (.) delimiters but are not part of a nested object and should be treated as flat properties.
         *
         * Example: "GIS.TS.SpEv_Lot_Notes.WBasketballN" as a fully qualified key in the attributes object.
         */
        collapsed?: boolean;
      }
  >;

  /**
   * Controls how popupData entries are resolved.
   *
   * `independent` resolves each entry only against the feature's original attributes.
   * `cumulative` also allows later entries to reference popupData values resolved earlier in the same object.
   *
   * Defaults to `independent`.
   */
  popupDataResolutionStrategy?: 'independent' | 'cumulative';

  /**
   * Legend items that are shown disabled in the legend as the layer visibility is on/off
   *
   * @deprecated Legend items are now rendered through the legend view model
   */
  legendItems?: LegendItem[];

  /**
   * If provided, will add layer to map with index. This allows layer ordering to prevent occlusion or
   * modify layer overlap.
   */
  layerIndex?: number;

  /**
   * String used to categorize layers in like groups.
   *
   * @deprecated Categorization is now done through group layers
   */
  category?: string;

  /**
   * Optional auth info used to register with the ArcGIS JS API's Identity Manager for accessing
   * protected resources.
   */
  auth?: LayerSourceAuthInfo;
};

interface LayerSourceAuthInfo {
  /**
   * OAuthInfo for the layer source
   */
  info: __esri.OAuthInfoProperties;

  /**
   * Indicates if the map service will attempt to fetch credentials immediately.
   *
   * The cases where this is necessary is unknown at the moment, but some layer services
   * do not trigger the OAuth flow automatically and enabling this will kick start that process.
   */
  forceCredentialFetch?: boolean;

  /**
   * The reasons are unknown at the moment but the identity service cannot find token service endpoint in some instances
   * and in those cases this property can be used to manually assert that URL.
   */
  overrideCredentialUrl?: string;
}

export interface LegendItem {
  /**
   * Unique legend item identifier
   */
  id: string;

  /**
   * Legend display name
  
   */
  title: string;

  /**
   * HTTP string or encoded data string
   */
  src: string;
}
