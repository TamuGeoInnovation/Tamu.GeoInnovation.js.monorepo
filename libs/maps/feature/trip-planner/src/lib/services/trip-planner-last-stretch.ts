import { distanceInMetres } from '@tamu-gisc/common/utils/geometry';

/**
 * A latitude and longitude in degrees, as a trip stop holds them: either may be missing before a stop is resolved.
 */
export interface LastStretchPoint {
  latitude?: number;
  longitude?: number;
}

/**
 * The part of a trip the routing network cannot draw: from where the route ends to the destination itself (#2639).
 *
 * The walking network has only paths, so a trip to a place off them, such as a tailgate tent in the middle of a lawn,
 * ends on the nearest path. Tent O62 on Ortega Lawn is 35 m from the walkway the route stops on.
 */
export interface LastStretch {
  /** Where the route ends, as `[longitude, latitude]`, the order a polyline's vertices are in. */
  from: [number, number];
  /** The destination, as `[longitude, latitude]`. */
  to: [number, number];
  /** The straight-line distance between them, in metres. */
  metres: number;
}

/**
 * Below this, the route already ends at the destination: the network snaps every stop a little.
 */
export const LAST_STRETCH_MIN_METRES = 5;

/**
 * Above this, the destination is not a short walk off a path, and a straight line to it would mislead: across a
 * building or a road. The trip ends where the network does, as it did before.
 */
export const LAST_STRETCH_MAX_METRES = 150;

/**
 * The last stretch from the end of a route to its destination, or null when there is none to draw.
 *
 * @param routeEnd The route's last vertex, `[longitude, latitude]` (a vertex may carry a third value, ignored).
 * @param destination The trip's last stop.
 */
export function lastStretch(routeEnd: number[] | undefined, destination: LastStretchPoint | undefined): LastStretch | null {
  if (!routeEnd || routeEnd.length < 2 || !destination) {
    return null;
  }

  const [longitude, latitude] = routeEnd;

  if (![longitude, latitude, destination.latitude, destination.longitude].every((n) => typeof n === 'number' && isFinite(n))) {
    return null;
  }

  const metres = distanceInMetres({ latitude, longitude }, destination as Required<LastStretchPoint>);

  if (metres < LAST_STRETCH_MIN_METRES || metres > LAST_STRETCH_MAX_METRES) {
    return null;
  }

  return { from: [longitude, latitude], to: [destination.longitude, destination.latitude], metres };
}

/**
 * The last vertex of the last path among a route's direction features, or undefined if none has one.
 */
export function routeEndVertex(features: Array<{ geometry?: unknown }> | undefined): number[] | undefined {
  for (let i = (features?.length ?? 0) - 1; i >= 0; i--) {
    const paths = (features[i].geometry as { paths?: number[][][] } | undefined)?.paths;
    const path = paths?.[paths.length - 1];

    if (path && path.length > 0) {
      return path[path.length - 1];
    }
  }

  return undefined;
}

/**
 * The trip's last written step when it ends with a last stretch: the distance, rounded to 5 m so it does not claim
 * more precision than a snapped route has, and the destination's name.
 */
export function lastStretchFinishText(stretch: LastStretch, destinationName: string, time: string): string {
  const metres = Math.max(LAST_STRETCH_MIN_METRES, Math.round(stretch.metres / 5) * 5);

  return `Leave the path and walk about ${metres} m to ${destinationName}, arriving at ${time}`;
}
