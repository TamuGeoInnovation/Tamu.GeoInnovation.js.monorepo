import { Point } from '@tamu-gisc/common/types';

import EsriPoint from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import { default as tCentroid } from '@turf/centroid';
import { polygon as tPolygon, Feature as tFeature, Point as tPoint } from '@turf/helpers';

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
    return pointFromPolylineGeometry(feature as __esri.Polyline);
  } else {
    throw new Error('Could not get centroid from search geometry because type could not be identified.');
  }
}

/**
 * Using Turf.js, attempts to calculate the centroid from an esri query feature set graphic.
 *
 * This is due tot he fact that esri query feature set graphics only contain rings, for polygons.
 */
export function centroidFromPolygonGeometry(feature: __esri.Polygon): Point {
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
export function getGeometryType(geometry: Partial<__esri.Geometry>): string {
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

export function pointFromMultiPointGeometry(feature: __esri.Multipoint): Point {
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

export function pointFromPointGeometry(feature: __esri.Point | Point): Point {
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

export function pointFromPolylineGeometry(feature: __esri.Polyline): Point {
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
      layers: ((layer as IPortalGroupLayer).layers as unknown as Array<AutocastableLayer>) || [],
      title: layer.name
    };
  }
}

export class CoordinateConverter {
  public webMercatorToGeographic(latitude: number, longitude: number) {
    return webMercatorUtils.webMercatorToGeographic(
      new EsriPoint({
        y: latitude,
        x: longitude,
        spatialReference: SpatialReference.WebMercator
      })
    ) as __esri.Point;
  }
}

export type FeatureUnion = __esri.Geometry | __esri.Polygon | __esri.Multipoint | __esri.Point | __esri.Polyline | Point;

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
  resolvedLayer: __esri.Layer;
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
  | { type: 'feature'; url: string; title?: string }
  | { type: 'map-image'; title?: string };

/**
 * JSON Portal representation for a Graphic class.
 */
export interface IGraphic {
  uid: number;
  geometry: {
    spatialReference: {
      latestWkid: number;
      wkid: number;
    };
    rings?: [[]];
    x?: number;
    y?: number;
    paths?: [[]];
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
  attributes: {
    [property: string]: string | boolean | number;
  };
  popupTemplate: __esri.PopupTemplate;
}
