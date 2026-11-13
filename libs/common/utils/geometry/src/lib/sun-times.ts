import { solarDeclinationAndEquationOfTime, sunPosition } from './sun';

/**
 * Texas A&M's main campus in College Station, by the Academic Building. The point AggieMap's dark mode reads the sun
 * from: a few kilometres either way moves sunrise and sunset by seconds.
 */
export const COLLEGE_STATION = { latitude: 30.615, longitude: -96.34 } as const;

/**
 * How far below the horizon the sun's centre is at sunrise and sunset, in degrees: half the sun's width (0.267) plus
 * the atmosphere's refraction at the horizon (0.567). The convention the US Naval Observatory and NOAA publish times by.
 */
export const SUNRISE_ALTITUDE = -0.833;

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

const toRadians = Math.PI / 180;
const toDegrees = 180 / Math.PI;
const minute = 60000;

/**
 * Sunrise and sunset on the local day that contains `moment`, at a latitude and longitude.
 *
 * "Local day" is the solar one (the UTC date after shifting by the longitude), so the answer does not depend on the zone
 * the browser is set to, and a moment late in the evening in Texas still gets that evening's sunset rather than the next
 * UTC day's. `null` where the sun neither rises nor sets that day, which happens only inside the polar circles.
 */
export function sunTimes(moment: Date, latitude: number, longitude: number): SunTimes | null {
  const solar = new Date(moment.getTime() + (longitude / 15) * 3600000);
  const dayStart = Date.UTC(solar.getUTCFullYear(), solar.getUTCMonth(), solar.getUTCDate());

  const sunrise = sunEvent(dayStart, latitude, longitude, -1);
  const sunset = sunEvent(dayStart, latitude, longitude, 1);

  return sunrise && sunset ? { sunrise, sunset } : null;
}

/**
 * Whether the sun has set at `moment`: its centre is below `SUNRISE_ALTITUDE`, so between that day's sunset and the
 * next sunrise. Read from the sun's position at that moment, so it needs no knowledge of which day it is.
 */
export function isSunDown(moment: Date, latitude: number, longitude: number): boolean {
  return sunPosition(moment, latitude, longitude).altitude < SUNRISE_ALTITUDE;
}

/**
 * The next sunrise or sunset after `moment`, whichever comes first: when the sky changes next. `null` inside the polar
 * circles on a day with neither.
 */
export function nextSunChange(moment: Date, latitude: number, longitude: number): Date | null {
  const day = 86400000;

  for (const offset of [0, day]) {
    const times = sunTimes(new Date(moment.getTime() + offset), latitude, longitude);

    if (!times) {
      return null;
    }

    const next = [times.sunrise, times.sunset].find((time) => time.getTime() > moment.getTime());

    if (next) {
      return next;
    }
  }

  return null;
}

/**
 * One sunrise (`direction` -1) or sunset (+1) on the UTC day starting at `dayStart`. The hour angle is found from the
 * declination at solar noon, then once more at the event itself, which moves it by under a minute and leaves it within
 * seconds of the published time.
 */
function sunEvent(dayStart: number, latitude: number, longitude: number, direction: -1 | 1): Date | null {
  let estimate = dayStart + (720 - 4 * longitude) * minute;

  for (let pass = 0; pass < 2; pass++) {
    const { declination, equationOfTime } = solarDeclinationAndEquationOfTime(new Date(estimate));

    const lat = latitude * toRadians;
    const decl = declination * toRadians;
    const cosHourAngle =
      (Math.sin(SUNRISE_ALTITUDE * toRadians) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));

    if (cosHourAngle < -1 || cosHourAngle > 1) {
      return null;
    }

    const hourAngle = Math.acos(cosHourAngle) * toDegrees;
    const solarNoon = 720 - 4 * longitude - equationOfTime;

    estimate = dayStart + (solarNoon + direction * 4 * hourAngle) * minute;
  }

  return new Date(estimate);
}
