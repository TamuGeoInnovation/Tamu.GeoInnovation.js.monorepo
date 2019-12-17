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
// Symbol Typings
//
interface CIMSymbolOptions {
  type: 'cim' & esri.CIMSymbolProperties;
}
interface FillSymbolOptions {
  symbol:
    | ({ type: 'simple-fill' } & esri.SimpleFillSymbolProperties)
    | { type: 'picture-fill' } & esri.PictureFillSymbolProperties;
}

interface LineSymbolOptions {
  symbol: { type: 'simple-line' } & esri.SimpleLineSymbolProperties;
}

interface MarkerSymbolOptions {
  symbol:
    | ({ type: 'simple-marker' } & esri.SimpleMarkerSymbolProperties)
    | { type: 'picture-marker' } & esri.PictureMarkerSymbolProperties;
}

interface MarkerSymbolOptions {
  symbol:
    | ({ type: 'simple-marker' } & esri.SimpleMarkerSymbolProperties)
    | { type: 'picture-marker' } & esri.PictureMarkerSymbolProperties;
}

interface Symbol3DOptions {
  symbol:
    | ({ type: 'point-3d' } & esri.PointSymbol3DProperties)
    | ({ type: 'line-3d' } & esri.LineSymbol3DProperties)
    | ({ type: 'polygon-3d' } & esri.PolygonSymbol3DProperties)
    | ({ type: 'mesh-3d' } & esri.MeshSymbol3DProperties)
    | ({ type: 'label-3d' } & esri.LabelSymbol3DProperties);
}

interface TextSymbolOptions {
  symbol: { type: 'text' } & esri.TextSymbolProperties;
}

interface WebStyleSymbolOptions {
  symbol: { type: 'web-style' } & esri.WebStyleSymbolProperties;
}

type Symbols =
  | CIMSymbolOptions
  | FillSymbolOptions
  | LineSymbolOptions
  | MarkerSymbolOptions
  | Symbol3DOptions
  | TextSymbolOptions
  | WebStyleSymbolOptions;

//
// Renderer Typings
//
interface ClassBreakRendererNativeOptions {
  renderer?: esri.ClassBreaksRendererProperties & { type: 'class-breaks' };
}

interface DotDensityRendererNativeOptions {
  renderer?: esri.DotDensityRendererProperties & { type: 'dot-density' };
}

interface SimpleRendererNativeOptions {
  renderer?: esri.SimpleRendererProperties & { type: 'simple' } & Symbols;
}

interface HeatmapRendererNativeOptions {
  renderer?: { type: 'heatmap' } & esri.HeatmapRendererProperties;
}

// TODO: Add plucked symbols
interface UniqueValueRendererNativeOptions {
  renderer?: esri.UniqueValueRendererProperties & { type: 'unique-value' };
}

type RendererNativeOptions =
  | ClassBreakRendererNativeOptions
  | DotDensityRendererNativeOptions
  | SimpleRendererNativeOptions
  | HeatmapRendererNativeOptions
  | UniqueValueRendererNativeOptions;

//
// Layer Source Type Typings
//

interface GraphicLayerSourceProperties {
  type: 'graphic';
  /**
   * Graphics used in the creation of the layer
   */
  graphics?: esri.Graphic[];
  native?: esri.GraphicsLayerProperties;
}

interface FeatureLayerSourceProperties {
  type: 'feature';
  native?: esri.FeatureLayerProperties & RendererNativeOptions;
}

interface SceneLayerSourceProperties {
  type: 'scene';
  native?: esri.SceneLayerProperties & RendererNativeOptions;
}

interface GeoJSONLayerSourceProperties {
  type: 'geojson';
  native?: esri.GeoJSONLayerProperties & RendererNativeOptions;
}

interface CSVLayerSourceProperties {
  type: 'csv';
  native?: esri.CSVLayerProperties & RendererNativeOptions;
}

export type LayerSourceType =
  | GraphicLayerSourceProperties
  | FeatureLayerSourceProperties
  | SceneLayerSourceProperties
  | GeoJSONLayerSourceProperties
  | CSVLayerSourceProperties;

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
   */
  listMode: string;

  /**
   * Determines whether the layer will be loaded on application load.
   *
   * A layer can be listed as "show" but not load on init. This will enable layer lazy-loading,
   * meaning layers will only load when requested.
   */
  loadOnInit: boolean;

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
   * Will default to false;
   */
  visible?: boolean;

  /**
   * Template that is shows when a feature from this layer is selected.
   *
   * If a template is not provided, a popup will not be shown.
   */
  popupTemplate?: esri.PopupTemplateProperties;

  popupComponent?: string;

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
