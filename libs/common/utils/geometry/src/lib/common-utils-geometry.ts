// Geometry with no map library, for the browser and for Nest. `getGeolocation` and
// `geolocationPermission` need a browser; everything else runs anywhere. The `esri` and `generic`
// entry points beside this one load map libraries and are for the browser.

import { from, Observable } from 'rxjs';

import * as gju from 'geojson-utils';

/**
 * A latitude and longitude in degrees (WGS84).
 *
 * The same shape as `Point` in `@tamu-gisc/common/types`, which accepts here as it is. It is not
 * imported from there because that file declares Esri types, which Nest applications do not load.
 */
export interface LatLon {
  latitude: number;
  longitude: number;
}

/**
 * Gets user geolocation if user allows.
 *
 * @param options Passed to the browser, for example `{ enableHighAccuracy: true, timeout: 15000 }`.
 */
export function getGeolocation(asObservable?: false, options?: PositionOptions): Promise<GeolocationCoordinates>;
export function getGeolocation(asObservable?: true, options?: PositionOptions): Observable<GeolocationCoordinates>;
export function getGeolocation(
  asObservable?: boolean,
  options?: PositionOptions
): Promise<GeolocationCoordinates> | Observable<GeolocationCoordinates> {
  const promise: Promise<GeolocationCoordinates> = new Promise((r, rj) => {
    window.navigator.geolocation.getCurrentPosition(
      (e) => {
        r(e.coords);
      },
      (err) => {
        rj(err);
      },
      options
    );
  });

  if (asObservable) {
    return from(promise);
  } else {
    return promise;
  }
}

/**
 * Whether this site may use the location: `granted`, `denied`, `prompt` (the browser will ask), or
 * `unknown` where the browser cannot say (#2559).
 */
export type GeolocationPermission = PermissionState | 'unknown';

/**
 * Whether this site may use the location, read without asking for it, and again each time it changes,
 * for example when it is allowed in the phone's settings. A browser remembers the answer for each
 * site, so a page that checks first can avoid asking again (#2559).
 */
export function geolocationPermission(): Observable<GeolocationPermission> {
  return new Observable<GeolocationPermission>((subscriber) => {
    const permissions = globalThis.navigator?.permissions;
    let status: PermissionStatus;
    let closed = false;

    const changed = () => subscriber.next(status.state);

    if (typeof permissions?.query !== 'function') {
      subscriber.next('unknown');

      return undefined;
    }

    // A browser that does not know `geolocation` as a permission name refuses the query.
    permissions.query({ name: 'geolocation' }).then(
      (s) => {
        if (closed) {
          return;
        }

        status = s;
        subscriber.next(s.state);
        s.addEventListener?.('change', changed);
      },
      () => {
        if (!closed) {
          subscriber.next('unknown');
        }
      }
    );

    return () => {
      closed = true;
      status?.removeEventListener?.('change', changed);
    };
  });
}

/**
 * Whether a value is a usable polygon: at least three corners, each a latitude and longitude in
 * range, in order around it so that no two of its sides cross. The first corner may be repeated at
 * the end.
 */
export function isLatLonPolygon(value: unknown): value is Array<LatLon> {
  return Array.isArray(value) && value.length >= 3 && value.every((c) => isLatLon(c)) && !sidesCross(value);
}

/**
 * Whether a value is a latitude and longitude in range.
 */
export function isLatLon(value: unknown): value is LatLon {
  const c = value as LatLon;

  return (
    Number.isFinite(c?.latitude) &&
    Number.isFinite(c?.longitude) &&
    Math.abs(c.latitude) <= 90 &&
    Math.abs(c.longitude) <= 180
  );
}

/**
 * Reads corners typed one per line as `latitude, longitude`, as Google Maps copies them.
 *
 * @returns The corners, an empty list for blank text, or `undefined` when a line is not a
 * latitude and longitude in range.
 */
export function parseLatLonLines(text: string): Array<LatLon> | undefined {
  const lines = (text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const corners = lines.map((line) => {
    const parts = line.split(/[\s,]+/).filter((p) => p.length > 0);

    if (parts.length !== 2) {
      return undefined;
    }

    const corner = { latitude: Number(parts[0]), longitude: Number(parts[1]) };

    return isLatLon(corner) ? corner : undefined;
  });

  return corners.every((c) => c !== undefined) ? corners : undefined;
}

/**
 * Writes corners one per line as `latitude, longitude`, the form `parseLatLonLines` reads.
 */
export function formatLatLonLines(corners: Array<LatLon>): string {
  return (corners ?? []).map((c) => `${c.latitude}, ${c.longitude}`).join('\n');
}

/**
 * Mean radius of the earth, in metres.
 */
export const EARTH_RADIUS = 6371008.8;

/**
 * Whether a point is inside a polygon, or within `margin` metres of its edge.
 *
 * @param point The point to test.
 * @param polygon The polygon's corners, in order around it, with or without the first repeated at
 * the end.
 * @param margin Metres outside the edge that still count as inside. Defaults to 0.
 */
export function isWithinPolygon(point: LatLon, polygon: Array<LatLon>, margin = 0): boolean {
  const ring = openRing(polygon);

  if (ring.length < 3) {
    return false;
  }

  const inside = gju.pointInPolygon(toGeoJsonPoint(point), {
    type: 'Polygon',
    coordinates: [[...ring, ring[0]].map((c) => toGeoJsonPoint(c).coordinates)]
  });

  return inside || (margin > 0 && distanceToPolygonEdge(point, ring) <= margin);
}

/**
 * The shortest distance, in metres, from a point to any side of a polygon, whether the point is
 * inside it or outside.
 *
 * Measured on a flat projection centred on the point, which is accurate to well under a metre for
 * polygons the size of a building or a campus block. Not for anything spanning many kilometres.
 *
 * @param point The point to measure from.
 * @param polygon The polygon's corners, in order around it, with or without the first repeated at
 * the end.
 */
export function distanceToPolygonEdge(point: LatLon, polygon: Array<LatLon>): number {
  const toRadians = Math.PI / 180;
  const metresPerDegree = EARTH_RADIUS * toRadians;
  const metresPerDegreeLongitude = metresPerDegree * Math.cos(point.latitude * toRadians);

  // Metres east (x) and north (y) of the point, which becomes the origin.
  const corners = openRing(polygon).map((c): [number, number] => [
    (c.longitude - point.longitude) * metresPerDegreeLongitude,
    (c.latitude - point.latitude) * metresPerDegree
  ]);

  let shortest = Infinity;

  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const [ax, ay] = corners[j];
    const [bx, by] = corners[i];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;

    // How far along the side the nearest point lies, from 0 at its start to 1 at its end.
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));

    shortest = Math.min(shortest, Math.hypot(ax + t * dx, ay + t * dy));
  }

  return shortest;
}

function toGeoJsonPoint(c: LatLon): { type: 'Point'; coordinates: [number, number] } {
  return { type: 'Point', coordinates: [c.longitude, c.latitude] };
}

/**
 * The polygon's corners without the first repeated at the end.
 */
function openRing(polygon: Array<LatLon>): Array<LatLon> {
  const first = polygon[0];
  const last = polygon[polygon.length - 1];

  return polygon.length > 1 && first.latitude === last.latitude && first.longitude === last.longitude
    ? polygon.slice(0, -1)
    : polygon;
}

/**
 * Whether any two sides of a polygon that do not share a corner cross or touch, as they do when its
 * corners are typed out of order.
 */
function sidesCross(polygon: Array<LatLon>): boolean {
  const ring = openRing(polygon);
  const sides = ring.map((c, i) => ({
    type: 'LineString',
    coordinates: [toGeoJsonPoint(c).coordinates, toGeoJsonPoint(ring[(i + 1) % ring.length]).coordinates]
  }));

  for (let i = 0; i < sides.length; i++) {
    // Skip the side itself, its neighbours (which share a corner with it), and pairs already tested.
    for (let j = i + 2; j < sides.length; j++) {
      if (i === 0 && j === sides.length - 1) {
        continue;
      }

      if (gju.lineStringsIntersect(sides[i], sides[j])) {
        return true;
      }
    }
  }

  return false;
}
