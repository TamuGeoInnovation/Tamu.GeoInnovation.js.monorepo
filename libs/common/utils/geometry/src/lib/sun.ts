/**
 * Where the sun is in the sky, seen from a point on the ground at a moment in time.
 *
 * `azimuth` is the compass bearing of the sun in degrees, clockwise from north (90 is east, 180 south, 270 west).
 * `altitude` is its height above the horizon in degrees: 90 overhead, 0 on the horizon, negative after sunset.
 */
export interface SunPosition {
  azimuth: number;
  altitude: number;
}

const toRadians = Math.PI / 180;
const toDegrees = 180 / Math.PI;

/**
 * The sun's declination in degrees and the equation of time in minutes for a moment, from NOAA's solar calculator
 * (after Meeus, *Astronomical Algorithms*, chapter 25). Accurate to about a hundredth of a degree for dates within a
 * few centuries of 2000, which is far finer than a shadow on a sidewalk needs.
 */
export function solarDeclinationAndEquationOfTime(date: Date): { declination: number; equationOfTime: number } {
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const t = (julianDay - 2451545) / 36525;

  const meanLongitude = mod(280.46646 + t * (36000.76983 + t * 0.0003032), 360);
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const m = meanAnomaly * toRadians;
  const centre =
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289;

  const omega = (125.04 - 1934.136 * t) * toRadians;
  const apparentLongitude = (meanLongitude + centre - 0.00569 - 0.00478 * Math.sin(omega)) * toRadians;

  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = (meanObliquity + 0.00256 * Math.cos(omega)) * toRadians;

  const declination = Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude)) * toDegrees;

  const y = Math.tan(obliquity / 2) ** 2;
  const l0 = meanLongitude * toRadians;
  const equationOfTime =
    4 *
    toDegrees *
    (y * Math.sin(2 * l0) -
      2 * eccentricity * Math.sin(m) +
      4 * eccentricity * y * Math.sin(m) * Math.cos(2 * l0) -
      0.5 * y * y * Math.sin(4 * l0) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * m));

  return { declination, equationOfTime };
}

/**
 * The sun's position seen from a latitude and longitude at a moment.
 *
 * The moment is absolute (a `Date` is UTC underneath), so it does not matter what zone the browser is in: a walk at
 * 3 PM Central is `new Date('2026-09-15T15:00:00-05:00')`. Atmospheric refraction is ignored; it lifts the sun by
 * about half a degree at the horizon and by nothing worth counting above ten degrees.
 */
export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const { declination, equationOfTime } = solarDeclinationAndEquationOfTime(date);

  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
  const trueSolarMinutes = mod(utcMinutes + equationOfTime + 4 * longitude, 1440);
  const hourAngle = (trueSolarMinutes / 4 - 180) * toRadians;

  const lat = latitude * toRadians;
  const decl = declination * toRadians;

  const cosZenith = clamp(
    Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle),
    -1,
    1
  );
  const altitude = 90 - Math.acos(cosZenith) * toDegrees;

  const azimuth = mod(
    Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) *
      toDegrees +
      180,
    360
  );

  return { azimuth, altitude };
}

function mod(value: number, by: number): number {
  return ((value % by) + by) % by;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
