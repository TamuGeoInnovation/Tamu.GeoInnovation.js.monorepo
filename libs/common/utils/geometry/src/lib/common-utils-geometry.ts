// Geometry with no map library, for the browser and for Nest.

/**
 * Mean radius of the earth, in metres.
 */
const EARTH_RADIUS = 6371008.8;

/**
 * The distance between two points in metres, along the earth's surface (haversine). Runs anywhere: in
 * the browser and in Nest, with no map library.
 *
 * @param a A latitude and longitude in degrees.
 * @param b Another.
 */
export function distanceInMetres(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRadians = Math.PI / 180;
  const dLatitude = (b.latitude - a.latitude) * toRadians;
  const dLongitude = (b.longitude - a.longitude) * toRadians;

  const h =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(a.latitude * toRadians) * Math.cos(b.latitude * toRadians) * Math.sin(dLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}
