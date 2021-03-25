import esri = __esri;

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
  type: 'cim' & esri.CIMSymbolProperties;
}

type SimpleFillSymbol = { type: 'simple-fill' } & esri.SimpleFillSymbolProperties;

type PictureFillSymbol = { type: 'picture-fill' } & esri.PictureFillSymbolProperties;

type SimpleLineSymbol = { type: 'simple-line' } & esri.SimpleLineSymbolProperties;

type SimpleMarkerSymbol = { type: 'simple-marker' } & esri.SimpleMarkerSymbolProperties;

type PictureMarkerSymbol = { type: 'picture-marker' } & esri.PictureMarkerSymbolProperties;

type Point3DSymbol = { type: 'point-3d' } & esri.PointSymbol3DProperties;

type Line3DSymbol = { type: 'line-3d' } & esri.LineSymbol3DProperties;

type Polygon3DSymbol = { type: 'polygon-3d' } & esri.PolygonSymbol3DProperties;

type Mesh3DSymbol = { type: 'mesh-3d' } & esri.MeshSymbol3DProperties;

type Label3DSymbol = { type: 'label-3d' } & esri.LabelSymbol3DProperties;

type TextSymbol = { type: 'text' } & esri.TextSymbolProperties;

type WebStyleSymbol = { type: 'web-style' } & esri.WebStyleSymbolProperties;

type Symbols =
  | SimpleFillSymbol
  | PictureFillSymbol
  | SimpleLineSymbol
  | SimpleMarkerSymbol
  | PictureMarkerSymbol
  | Point3DSymbol
  | Line3DSymbol
  | Polygon3DSymbol
  | Mesh3DSymbol
  | Label3DSymbol
  | TextSymbol
  | WebStyleSymbol;

//
// Autocasting Symbol Typings
//
interface FillSymbolAutoCastOptions {
  symbol: (SimpleFillSymbol & esri.SimpleFillSymbolProperties) | (PictureFillSymbol & esri.PictureFillSymbolProperties);
}

interface LineSymbolAutoCastOptions {
  symbol: SimpleLineSymbol & esri.SimpleLineSymbolProperties;
}

interface MarkerSymbolAutoCastOptions {
  symbol:
    | (SimpleMarkerSymbol & esri.SimpleMarkerSymbolProperties)
    | (PictureMarkerSymbol & esri.PictureMarkerSymbolProperties);
}

interface Symbol3DAutoCastOptions {
  symbol:
    | (Point3DSymbol & esri.PointSymbol3DProperties)
    | (Line3DSymbol & esri.LineSymbol3DProperties)
    | (Polygon3DSymbol & esri.PolygonSymbol3DProperties)
    | (Mesh3DSymbol & esri.MeshSymbol3DProperties)
    | (Label3DSymbol & esri.LabelSymbol3DProperties);
}

interface TextSymbolAutoCastOptions {
  symbol: TextSymbol & esri.TextSymbolProperties;
}

interface WebStyleSymbolAutoCastOptions {
  symbol: WebStyleSymbol & esri.WebStyleSymbolProperties;
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
type ClassBreakRendererNativeOptions = Omit<esri.ClassBreaksRendererProperties, 'backgroundFillSymbol'> & {
  type: 'class-breaks';
  backgroundFillSymbol?: SimpleFillSymbol | PictureFillSymbol | Polygon3DSymbol;
};

/**
 * Auto-castable dot density renderer interface inheriting most of the Esri Dot Density Renderer properties except some which
 * are overwritten where they support auto-casting.
 */
type DotDensityRendererNativeOptions = Omit<esri.DotDensityRendererProperties, 'visualVariables'> & {
  type: 'dot-density';
  visualVariables?: esri.VisualVariableProperties[];
};

/**
 * Auto-castable heatmanp renderer options, inheriting Esri's Heatmap Renderer properties.
 */
type HeatmapRendererNativeOptions = esri.HeatmapRendererProperties & { type: 'heatmap' };
/**
 * Auto-castable simple renderer interface inheriting most of the Esri Simple Renderer properties except some which
 * are overwritten where they support auto-casting.
 */
type SimpleRendererNativeOptions = Omit<esri.SimpleRendererProperties, 'symbol'> & {
  type: 'simple';
} & AutoCastSymbols;

/**
 * Auto-castable unique value interface inheriting most of the Esri Unique Value Renderer properties except some which are overwritten
 * where they support auto-casting.
 */
type UniqueValueRendererNativeOptions = Omit<esri.UniqueValueRendererProperties, 'backgroundFillSymbol'> & {
  type: 'unique-value';
  backgroundFillSymbol?: SimpleFillSymbol | PictureFillSymbol | Polygon3DSymbol;
};

type RendererAutoCastNativeOptions =
  | ClassBreakRendererNativeOptions
  | DotDensityRendererNativeOptions
  | SimpleRendererNativeOptions
  | HeatmapRendererNativeOptions
  | UniqueValueRendererNativeOptions;

//
// Layer Source Type Typings
//

interface FeatureLayerSourceProperties {
  type: 'feature';

  native?: Omit<esri.FeatureLayerProperties, 'renderer' | 'labelingInfo'> & {
    labelingInfo?: ({ symbol?: TextSymbol | Label3DSymbol } & Omit<esri.LabelClassProperties, 'symbol'>)[];
    renderer?: RendererAutoCastNativeOptions;
  };
}

interface SceneLayerSourceProperties {
  type: 'scene';
  native?: Omit<esri.SceneLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

interface GeoJSONLayerSourceProperties {
  type: 'geojson';
  native?: Omit<esri.GeoJSONLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

interface CSVLayerSourceProperties {
  type: 'csv';
  native?: Omit<esri.CSVLayerProperties, 'renderer'> & { renderer?: RendererAutoCastNativeOptions };
}

interface GraphicLayerSourceProperties {
  type: 'graphic';

  /**
   * Graphics used in the creation of the layer
   */
  graphics?: esri.Graphic[];
  native?: esri.GraphicsLayerProperties;
}

interface GroupLayerSourceProperties {
  type: 'group';

  /**
   * Graphics used in the creation of the layer
   */
  native?: esri.GroupLayerProperties;
}

interface PortalMapServerLayerSourceProperties {
  type: 'map-server';

  /**
   * Portal service base URL. The schema for the service will be pulled and all layers contained in the definition
   * will be loaded.
   */
  url: string;

  native: {};
}

export type LayerSourceType =
  | FeatureLayerSourceProperties
  | SceneLayerSourceProperties
  | GeoJSONLayerSourceProperties
  | CSVLayerSourceProperties
  | GraphicLayerSourceProperties
  | GroupLayerSourceProperties
  | PortalMapServerLayerSourceProperties;

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
   */
  loadOnInit?: boolean;

  /**
   * URL for the layer service, if applicable.
   *
   * If the service contains multiple layers, point to the sub layer that will be added. For example:
   *
   * `http://source.com/to/layer/0`
   */
  url?: string;

  /**
   * Current visible state for a layer.
   *
   * Will default to true;
   */
  visible?: boolean;

  /**
   * Template that is shows when a feature from this layer is selected.
   *
   * If a template is not provided, a popup will not be shown.
   */
  popupTemplate?: esri.PopupTemplateProperties;

  // tslint:disable-next-line:no-any
  popupComponent?: any;

  /**
   * Legend items that are shown disabled in the legend as the layer visibility is on/off
   */
  legendItems?: LegendItem[];

  /**
   * If provided, will add layer to map with index. This allows layer ordering to prevent occlusion or
   * modify layer overlap.
   */
  layerIndex?: number;

  category?: string;
};

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
