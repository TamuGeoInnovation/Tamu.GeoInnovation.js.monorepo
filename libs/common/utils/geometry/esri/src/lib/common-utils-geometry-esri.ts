import { Point } from '@tamu-gisc/common/types';
import esri = __esri;

import { default as tCentroid } from '@turf/centroid';
import { polygon as tPolygon, Feature as tFeature, Point as tPoint } from '@turf/helpers';

/**
 * Attempts to determine a singular point (latitude and longitude) utilizing
 * a provided TripPoint raw geometry object.
 *
 * @export
 * @param feature Esri geometry
 */
export function centroidFromGeometry(
  feature: esri.Geometry | esri.Polygon | esri.Multipoint | esri.Point | esri.Polyline | Point
): Point {
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
    const p: tFeature<tPoint> = tCentroid(tPolygon([...(feature as esri.Polygon).rings]));

    if (p && p.geometry && p.geometry.coordinates) {
      return {
        latitude: p.geometry.coordinates[1],
        longitude: p.geometry.coordinates[0]
      };
    } else {
      return undefined;
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
export function getGeometryType(geometry: esri.Geometry): string {
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
  if (feature && 'x' in feature && 'y' in feature) {
    return {
      latitude: feature.y,
      longitude: feature.x
    };
  } else if (feature && feature.longitude && feature.latitude) {
    return {
      latitude: feature.latitude,
      longitude: feature.longitude
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
