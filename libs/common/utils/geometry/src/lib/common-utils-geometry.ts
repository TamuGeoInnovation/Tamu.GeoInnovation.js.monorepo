// Geometry with no map library, for the browser and for Nest. `getGeolocation` needs a browser;
// everything else runs anywhere. The `esri` and `generic` entry points beside this one load map
// libraries and are for the browser.

import { from, Observable } from 'rxjs';

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
 * Whether a value is a usable polygon: at least three corners, each a latitude and longitude in
 * range.
 */
export function isLatLonPolygon(value: unknown): value is Array<LatLon> {
  return Array.isArray(value) && value.length >= 3 && value.every((c) => isLatLon(c));
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
const EARTH_RADIUS = 6371008.8;

/**
 * Whether a point is inside a polygon, or within `margin` metres of its edge.
 *
 * Distances are measured on a flat projection centred on the point, which is accurate to well under
 * a metre for polygons the size of a building or a campus block. Not for anything spanning many
 * kilometres.
 *
 * @param point The point to test.
 * @param polygon The polygon's corners, in order around it, with or without the first repeated at
 * the end.
 * @param margin Metres outside the edge that still count as inside. Defaults to 0.
 */
export function isWithinPolygon(point: LatLon, polygon: Array<LatLon>, margin = 0): boolean {
  const corners = toMetres(point, polygon);

  if (corners.length < 3) {
    return false;
  }

  if (containsOrigin(corners)) {
    return true;
  }

  return margin > 0 && distanceFromOriginToEdge(corners) <= margin;
}

/**
 * Projects the polygon's corners to metres east (x) and north (y) of the point, which becomes the
 * origin.
 */
function toMetres(origin: LatLon, polygon: Array<LatLon>): Array<[number, number]> {
  const toRadians = Math.PI / 180;
  const metresPerDegree = EARTH_RADIUS * toRadians;
  const metresPerDegreeLongitude = metresPerDegree * Math.cos(origin.latitude * toRadians);

  const corners = polygon.map(
    (c): [number, number] => [
      (c.longitude - origin.longitude) * metresPerDegreeLongitude,
      (c.latitude - origin.latitude) * metresPerDegree
    ]
  );

  const first = corners[0];
  const last = corners[corners.length - 1];

  if (corners.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    corners.pop();
  }

  return corners;
}

/**
 * Ray casting: a ray from the origin crosses the polygon's edge an odd number of times when the
 * origin is inside.
 */
function containsOrigin(corners: Array<[number, number]>): boolean {
  let inside = false;

  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const [xi, yi] = corners[i];
    const [xj, yj] = corners[j];

    if (yi > 0 !== yj > 0 && 0 < ((xj - xi) * (0 - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * The shortest distance from the origin to any side of the polygon.
 */
function distanceFromOriginToEdge(corners: Array<[number, number]>): number {
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
