import { Observable, from } from 'rxjs';

import { Point } from '@tamu-gisc/common/types';

import { loadModules } from 'esri-loader';
import { default as tCentroid } from '@turf/centroid';
import { polygon as tPolygon, Feature as tFeature, Point as tPoint } from '@turf/helpers';

import esri = __esri;

/**
 * Attempts to determine a singular point (latitude and longitude) utilizing
 * a provided TripPoint raw geometry object.
 *
 * @export
 * @param feature Esri geometry
 */
export function centroidFromGeometry(feature: FeatureUnion): Point {
  if ('rings' in feature) {
    // If geometry is polygon
    return centroidFromPolygonGeometry(feature);
  } else if ('points' in feature) {
    // If geometry is a multipoint set
    return pointFromMultiPointGeometry(feature);
  } else if (('x' in feature && 'y' in feature) || ('latitude' in feature && 'longitude' in feature)) {
    return pointFromPointGeometry(feature);
  } else if ('paths' in feature) {
    return pointFromPolylineGeometry(feature);
  } else {
    throw new Error('Could not get centroid from search geometry because type could not be identified.');
  }
}

/**
 * Using Turf.js, attempts to calculate the centroid from an esri query feature set graphic.
 *
 * This is due tot he fact that esri query feature set graphics only contain rings, for polygons.
 */
export function centroidFromPolygonGeometry(feature: esri.Polygon): Point {
  if (feature.centroid && feature.centroid.latitude && feature.centroid.longitude) {
    return {
      latitude: feature.centroid.latitude,
      longitude: feature.centroid.longitude
    };
  } else if (feature.rings) {
    // Result type is a Turf Point
    const p: tFeature<tPoint> = tCentroid(tPolygon([...feature.rings]));

    if (p && p.geometry && p.geometry.coordinates) {
      return {
        latitude: p.geometry.coordinates[1],
        longitude: p.geometry.coordinates[0]
      };
    }
  } else {
    throw new Error('Feature provided does not contain rings.');
  }
}

/**
 * Determine geometry type based on geometry properties
 *
 * Possible return values:
 *
 * - Point
 * - Multipoint
 * - Polygon
 * - Polyline
 *
 * @export
 * @param  geometry String representing geometry type.
 */
export function getGeometryType(geometry: Partial<esri.Geometry>): string {
  if (geometry) {
    if (('latitude' in geometry && 'longitude' in geometry) || ('y' in geometry && 'x' in geometry)) {
      return 'point';
    } else if ('points' in geometry) {
      return 'multipoint';
    } else if ('rings' in geometry) {
      return 'polygon';
    } else if ('paths' in geometry) {
      return 'polyline';
    } else {
      throw new Error('Could not resolve geometry type.');
    }
  } else {
    throw new Error('Could not determine geometry type because geometry was not provided.');
  }
}

export function pointFromMultiPointGeometry(feature: esri.Multipoint): Point {
  if (feature.points && feature.points.length > 0) {
    // Get the first point in the feature
    const p: number[] = feature.points[0];

    return {
      latitude: p[1],
      longitude: p[0]
    };
  } else {
    throw new Error('Feature provided does not contain points.');
  }
}

export function pointFromPointGeometry(feature: esri.Point | Point): Point {
  if (feature && feature.longitude && feature.latitude) {
    return {
      latitude: feature.latitude,
      longitude: feature.longitude
    };
  } else if (feature && 'x' in feature && 'y' in feature) {
    return {
      latitude: feature.y,
      longitude: feature.x
    };
  } else {
    throw new Error('Feature provided does not have x or y.');
  }
}

export function pointFromPolylineGeometry(feature: esri.Polyline): Point {
  if (feature && feature.paths) {
    return {
      latitude: feature.extent.center.latitude,
      longitude: feature.extent.center.longitude
    };
  } else {
    throw new Error('Feature provided does not contain paths.');
  }
}

export function getLayerTypeFromPortalJSON(layer: { type: string }) {
  switch (layer.type) {
    case PORTAL_LAYER_TYPES.FEATURE_LAYER:
      return API_LAYER_TYPES.FEATURE_LAYER;
    case PORTAL_LAYER_TYPES.GRAPHICS_LAYER:
      return API_LAYER_TYPES.GRAPHICS_LAYER;
    case PORTAL_LAYER_TYPES.GROUP_LAYER:
      return API_LAYER_TYPES.GROUP_LAYER;
    case PORTAL_LAYER_TYPES.CSV_LAYER:
      return API_LAYER_TYPES.CSV_LAYER;
    case PORTAL_LAYER_TYPES.SCENE_LAYER:
      return API_LAYER_TYPES.SCENE_LAYER;
    default:
      return 'unknown';
  }
}

/**
 * Strips unnecessary layer definition properties from a Portal JSON representation
 * to create bare minimum auto-castable layers.
 */
export function cleanPortalJSONLayer(layer: IPortalLayer, url: string): AutocastableLayer {
  if (layer.type === API_LAYER_TYPES.FEATURE_LAYER) {
    return {
      type: 'feature',
      url: `${url}/${layer.id}`,
      title: layer.name
    };
  } else if (layer.type === API_LAYER_TYPES.GROUP_LAYER) {
    return {
      type: 'group',
      layers: (((layer as IPortalGroupLayer).layers as unknown) as Array<AutocastableLayer>) || [],
      title: layer.name
    };
  }
}
export class PolygonMaker {
  private modules: {
    graphic: esri.GraphicConstructor;
    polygon: esri.PolygonConstructor;
    simpleFillSymbol: esri.SimpleFillSymbolConstructor;
    simpleLineSymbol: esri.SimpleLineSymbolConstructor;
  } = { graphic: undefined, polygon: undefined, simpleFillSymbol: undefined, simpleLineSymbol: undefined };

  constructor() {
    loadModules(['esri/Graphic', 'esri/geometry/Polygon', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol'])
      .then(
        ([g, p, sfs, sls]: [
          esri.GraphicConstructor,
          esri.PolygonConstructor,
          esri.SimpleFillSymbolConstructor,
          esri.SimpleLineSymbolConstructor
        ]) => {
          this.modules.graphic = g;
          this.modules.polygon = p;
          this.modules.simpleFillSymbol = sfs;
          this.modules.simpleLineSymbol = sls;
        }
      )
      .catch((err) => {
        throw new Error('Could not load PolygonMaker modules.');
      });
  }

  public async makePolygon(shape: IGraphic, color: number[] = [250, 128, 114]): Promise<esri.Graphic> {
    return new this.modules.graphic({
      geometry: new this.modules.polygon({
        // we use IGraphic instead of esri.Graphic because geometry.rings does not exist on type esri.Graphic
        rings: shape.geometry.rings,
        spatialReference: shape.geometry.spatialReference
      }),
      symbol: new this.modules.simpleFillSymbol({
        color: [...color, 0.4],
        outline: new this.modules.simpleLineSymbol({
          type: 'simple-line',
          style: 'solid',
          color: [...color, 0.7],
          // we use IGraphic instead of esri.Graphic because symbol.outline does not exist on type esri.Graphic
          width: shape.symbol.outline.width
        })
      })
    });
  }

  public async makeArrayOfPolygons(shapes: IGraphic[], color: number[] = [114, 168, 250]): Promise<Array<esri.Graphic>> {
    const graphics = shapes.map((graphicProperties: IGraphic) => {
      const graphic = new this.modules.graphic({
        geometry: new this.modules.polygon({
          // we use IGraphic instead of esri.Graphic because geometry.rings does not exist on type esri.Graphic
          rings: graphicProperties.geometry.rings,
          spatialReference: graphicProperties.geometry.spatialReference
        }),
        symbol: new this.modules.simpleFillSymbol({
          color: [...color, 0.4],
          outline: new this.modules.simpleLineSymbol({
            type: 'simple-line',
            style: 'solid',
            color: [...color, 0.7],
            // we use IGraphic instead of esri.Graphic because symbol.outline does not exist on type esri.Graphic
            width: graphicProperties.symbol.outline.width
          })
        })
      });

      return graphic;
    });

    return graphics;
  }
}

export class CoordinateConverter {
  private modules: {
    point: esri.PointConstructor;
    spatialReference: esri.SpatialReferenceConstructor;
    webMercatorUtils: esri.webMercatorUtils;
  } = { point: undefined, spatialReference: undefined, webMercatorUtils: undefined };

  constructor() {
    loadModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/geometry/support/webMercatorUtils'])
      .then(([p, s, u]: [esri.PointConstructor, esri.SpatialReferenceConstructor, esri.webMercatorUtils]) => {
        this.modules.point = p;
        this.modules.spatialReference = s;
        this.modules.webMercatorUtils = u;
      })
      .catch((err) => {
        throw new Error('Could not load CoordinateConverter modules.');
      });
  }

  public webMercatorToGeographic(latitude: number, longitude: number) {
    return this.modules.webMercatorUtils.webMercatorToGeographic(
      new this.modules.point({
        y: latitude,
        x: longitude,
        spatialReference: this.modules.spatialReference.WebMercator
      })
    ) as esri.Point;
  }
}

export type FeatureUnion = esri.Geometry | esri.Polygon | esri.Multipoint | esri.Point | esri.Polyline | Point;

export enum PORTAL_LAYER_TYPES {
  GRAPHICS_LAYER = 'Graphics Layer',
  FEATURE_LAYER = 'Feature Layer',
  GROUP_LAYER = 'Group Layer',
  CSV_LAYER = 'CSV Layer',
  GEOJSON_LAYER = 'GeoJSON Layer',
  SCENE_LAYER = 'Scene Layer'
}

export enum API_LAYER_TYPES {
  GRAPHICS_LAYER = 'graphics',
  FEATURE_LAYER = 'feature',
  GROUP_LAYER = 'group',
  CSV_LAYER = 'csv',
  GEOJSON_LAYER = 'geojson',
  SCENE_LAYER = 'scene'
}

interface IBasePortalLayer {
  id: number;
  name: string;
  parentLayerId: number;
  defaultVisibility: boolean;
  minScale: number;
  maxScale: number;
  type: string;
  supportsDynamicLegends: boolean;
  resolvedLayer: esri.Layer;
}

export interface IPortalFeatureLayer extends IBasePortalLayer {
  subLayerIds: null;
}

export interface IPortalGroupLayer extends IBasePortalLayer {
  subLayerIds: Array<number>;
  layers?: Array<IPortalLayer>;
}

export type IPortalLayer = IPortalFeatureLayer | IPortalGroupLayer;

export type AutocastableLayer =
  | { type: 'group'; layers: Array<AutocastableLayer>; title?: string }
  | { type: 'feature'; url: string; title?: string };
export interface IGraphic {
  geometry: {
    spatialReference: {
      latestWkid: number;
      wkid: number;
    };
    rings: [[]];
    type: string;
  };
  symbol: {
    type: string;
    color: number[];
    width: number;
    outline: {
      type: string;
      color: number[];
      style: string;
      width: number;
    };
    style: string;
  };
  attributes: {};
  popupTemplate: {};
}
