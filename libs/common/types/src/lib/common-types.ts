import esri = __esri;
import QueryProperties = __esri.QueryProperties;
import Graphic = __esri.Graphic;

/**
 * Basic representation of a geographic point with longitude (x) and latitude(y) values
 *
 * @export
 */
export interface Point {
  latitude: number;
  longitude: number;
}

/**
 * Describes the properties for each layer source used by a layer factory to add layers to the map as required.
 *
 * @export
 * @interface LayerSourceProperties
 */
export interface LayerSource {
  /**
   * Unique value used to reference a particular layer source.
   *
   * Value will also be used as the internal layer id.
   *
   * @type {string}
   * @memberof LayerSourceProperties
   */
  id: string;

  /**
   * Display value used for UI representation.
   *
   * @type {string}
   * @memberof LayerSourceProperties
   */
  title: string;

  /**
   * URL for the layer service, if applicable.
   *
   * If the service contains multiple layers, point to the sub layer that will be added. For example:
   *
   * `http://source.com/to/layer/0`
   *
   * @type {string}
   * @memberof LayerSourceProperties
   */
  url?: string;

  /**
   * Collection of graphics, if applicable
   *
   * Used when creating a layer of type 'graphic'.
   *
   * @type {esri.Graphic[]}
   * @memberof LayerSource
   */
  graphics?: esri.Graphic[];

  /**
   * Layer type. Layer factory will use this type to instantiate the correct layer class.
   *
   * Allowed values include:
   *
   * - graphic
   * - feature
   * - geojson
   * - csv
   *
   * @type {string}
   * @memberof LayerSourceProperties
   */
  type: 'graphic' | 'feature' | 'scene' | 'geojson' | 'csv';

  /**
   * Determines whether the layer will be listed by the layer component.
   *
   * @type {string}
   * @memberof LayerSourceProperties
   */
  listMode: string;

  /**
   * Determines whether the layer will be loaded on application load.
   *
   * A layer can be listed as "show" but not load on init. This will enable layer lazy-loading,
   * meaning layers will only load when requested.
   *
   * @type {boolean}
   * @memberof LayerSourceProperties
   */
  loadOnInit: boolean;

  /**
   * Current visible state for a layer.
   *
   * Will default to false;
   *
   * @type {boolean}
   * @memberof LayerSourceProperties
   */
  visible?: boolean;

  /**
   * Template that is shows when a feature from this layer is selected.
   *
   * If a template is not provided, a popup will not be shown.
   *
   * @type {esri.PopupTemplate}
   * @memberof LayerSourceProperties
   */
  popupTemplate?: esri.PopupTemplateProperties;

  popupComponent?: string;

  /**
   * Legend items that are shown disabled in the legend as the layer visibility is on/off
   *
   * @type {LegendItem[]}
   * @memberof LayerSource
   */
  legendItems?: LegendItem[];

  /**
   * Any other native properties that will be supplied as constructor properties for the layer.
   *
   * TODO improve type checking.
   *
   * @type {{}}
   * @memberof LayerSourceProperties
   */
  native?: {
    [s: string]:
      | string
      | number
      | { [s: string]: string | { [s: string]: string | number | number[] | { [s: string]: string } } }
      // | { [s: string]: string | string[] | number | { [s: string]: string | string[] | number | { [s: string]: string } }[] };
    };

  /**
   * If provided, will add layer to map with index. This allows layer ordering to prevent occlusion or
   * modify layer overlap.
   *
   * @type {number}
   * @memberof LayerSource
   */
  layerIndex?: number;

  category?: string;
}

export interface LegendItem {
  /**
   * Unique legend item identifier
   *
   * @type {string}
   * @memberof LegendItem
   */
  id: string;

  /**
   * Legend display name
   *
   * @type {string}
   * @memberof LegendItem
   */
  title: string;

  /**
   * HTTP string or encoded data string
   *
   * @type {string}
   * @memberof LegendItem
   */
  src: string;
}
