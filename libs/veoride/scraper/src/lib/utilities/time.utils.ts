import date from 'date-and-time';

/**
 * Converts an extended ISO 8601 timestamp, used as an MDS request parameter, to a standard Date object.
 *
 * @param {string} timestamp ISO 8601 YYYY-MM-DDTHH extended timestamp
 */
export function mdsTimeHourToDate(timestamp: string, utc?: boolean): Date {
  const [d, h] = timestamp.split('T');

  const parsed = date.parse(`${d} ${h}`, 'YYYY-MM-DD HH', utc !== undefined ? utc : false);

  return parsed;
}

/**
 * Converts standard date object to extended ISO 8601 timestamp used in MDS request parameters.
 *
 * @param {Date} datetime Standard date object
 */
export function dateToMdsTimeHour(datetime: Date): string {
  const formatted = date.format(datetime, 'YYYY-MM-DD HH');

  const joined = formatted.split(' ').join('T');

  return joined;
}

/**
 * Adds one hour to a the provided extended ISO 8601 timestamp.
 *
 * @param {*} timestamp ISO 8601 YYYY-MM-DDTHH extended timestamp
 */
export function mdsTimeHourIncrement(timestamp: string) {
  const parsed = mdsTimeHourToDate(timestamp);

  const incremented = date.addHours(parsed, 1);

  const formatted = dateToMdsTimeHour(incremented);

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
