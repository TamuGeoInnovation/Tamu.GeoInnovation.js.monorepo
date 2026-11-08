import { sessionTime } from '@tamu-gisc/gisday/common';

/**
 * Accepts an event day's date and a stored time (`09:00:00 GMT-0600 (Central Standard Time)`) and returns the
 * instant the session starts or ends, or null when either is missing or cannot be read.
 *
 * This is useful for event dates and times which are stored as separate columns in the database. The day is taken
 * as its calendar date in Central time, wherever the visitor is, as check-in does (`sessionTime`, #2710). It used to
 * be the visitor's own date, which further west is the day before, so a Thursday session was put on Wednesday.
 */
export function parseDateStrings(dateString: string | Date, timeString: string) {
  // A stored time that cannot be read, such as "Invalid Date" (#1772), answers null like a missing one.
  // An invalid Date makes Angular's date pipe throw, which took the whole Sessions page down.
  return sessionTime(dateString, timeString);
}
