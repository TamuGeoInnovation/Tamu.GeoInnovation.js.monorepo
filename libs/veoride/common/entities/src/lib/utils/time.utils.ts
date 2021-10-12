import { DateTime } from 'luxon';

const timestampFormat = "yyyy-LL-dd'T'HH";

/**
 * Converts an extended ISO 8601 timestamp, used as an MDS request parameter, to a standard Date object.
 *
 * @param {string} timestamp ISO 8601 YYYY-MM-DDTHH extended timestamp
 */
export function mdsTimeHourToDate(timestamp: string, isUtc?: boolean): Date {
  let parsed;

  if (isUtc) {
    parsed = DateTime.fromFormat(`${timestamp}+0`, `${timestampFormat}Z`);
  } else {
    parsed = DateTime.fromFormat(timestamp, timestampFormat);
  }

  return parsed.toJSDate();
}

/**
 * Converts standard date object to extended ISO 8601 timestamp used in MDS request parameters.
 *
 * @param {Date} datetime Standard date object
 */
export function dateToMdsTimeHour(datetime: Date, isUtc?: boolean): string {
  let parsed = DateTime.fromJSDate(datetime);

  if (isUtc) {
    parsed = parsed.setZone('utc');
  }

  const formatted = parsed.toFormat(timestampFormat);

  return formatted;
}

/**
 * Adds one hour to a the provided extended ISO 8601 timestamp.
 *
 * @param {*} timestamp ISO 8601 YYYY-MM-DDTHH extended timestamp
 */
export function mdsTimeHourIncrement(timestamp: string) {
  const d = mdsTimeHourToDate(timestamp);
  const parsed = DateTime.fromJSDate(d);

  let incremented = parsed.plus({ hours: 1 });

  // Account for DST ending
  if (parsed.hour === incremented.hour) {
    incremented = incremented.plus({ hours: 1 });
  }

  const formatted = dateToMdsTimeHour(incremented.toJSDate());

  return formatted;
}

/**
 * Determines if two date objects exceed a maximum time difference.
 */
export function dateDifferenceGreaterThan(
  newest: Date,
  oldest: Date,
  maxDifference: number,
  unit: 'seconds' | 'minutes' | 'hours'
) {
  let difference = newest.getTime() - oldest.getTime();

  if (unit === 'seconds' || 'minutes' || 'hours') {
    difference = difference / 1000;
  }

  if (unit === 'minutes' || 'hours') {
    difference = difference / 60;
  }

  if (unit === 'hours') {
    difference = difference / 60;
  }

  return difference > maxDifference;
}
