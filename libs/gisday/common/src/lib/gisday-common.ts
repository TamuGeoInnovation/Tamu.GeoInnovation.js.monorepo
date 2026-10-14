export enum COMPETITION_VALIDATION_STATUS {
  unverified = 'unverified',
  verified = 'verified',
  discarded = 'discarded'
}

/**
 * Metres outside a location's check-in zone that still count as inside it, for GPS error indoors
 * (#1766). The zone itself is on each event location, as `checkInZone`.
 */
export const CHECK_IN_ZONE_MARGIN = 30;

/**
 * The one event mode whose check-in needs the attendee inside its location's zone. Hybrid and
 * virtual events can be attended online.
 */
export const CHECK_IN_ZONE_EVENT_MODE = 'in-person';

/**
 * What an attendee outside the zone is told, by the API and by the page.
 *
 * @param venue The location's name, such as "TAMU Rudder Plaza", when it has one.
 */
export function checkInZoneMessage(venue?: string): string {
  return venue
    ? `You need to be inside the check-in zone at ${venue} to check in to this event.`
    : 'You need to be inside the check-in zone for this event to check in.';
}

/**
 * Minutes after an event's end that check-in stays open, for attendees who check in late.
 */
export const CHECK_IN_GRACE_MINUTES = 15;

/**
 * The time zone GIS Day's days are kept in: a day is stored as its midnight there.
 */
const GISDAY_TIME_ZONE = 'America/Chicago';

/**
 * When check-in to an event opens and closes: from its start until `CHECK_IN_GRACE_MINUTES` after its
 * end, as the event page shows it.
 *
 * @param day The event's day, `SeasonDay.date`.
 * @param startTime The event's start, as stored, for example `16:00:00 GMT-0600 (Central Standard Time)`.
 * @param endTime The event's end, the same way.
 * @returns `undefined` when the day or either time is missing or cannot be read.
 */
export function checkInWindow(day: Date | string, startTime: string, endTime: string): { opens: Date; closes: Date } | undefined {
  if (!day || !startTime || !endTime) {
    return undefined;
  }

  const date = new Date(day);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  // The calendar day in Central time, as YYYY-MM-DD.
  const calendarDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: GISDAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

  const opens = atTime(calendarDay, startTime);
  const closes = atTime(calendarDay, endTime);

  if (!opens || !closes) {
    return undefined;
  }

  closes.setMinutes(closes.getMinutes() + CHECK_IN_GRACE_MINUTES);

  return { opens, closes };
}

/**
 * A time of day in Central time, for showing when check-in opens, for example `4:00 PM`.
 */
export function formatCheckInTime(time: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: GISDAY_TIME_ZONE, hour: 'numeric', minute: '2-digit' }).format(time);
}

/**
 * The instant a stored time (`HH:mm[:ss] GMT±hhmm ...`) falls on a calendar day (`YYYY-MM-DD`).
 */
function atTime(calendarDay: string, time: string): Date | undefined {
  const parts = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*GMT([+-])(\d{2})(\d{2})/.exec(time.trim());

  if (!parts) {
    return undefined;
  }

  const [, hours, minutes, seconds, sign, offsetHours, offsetMinutes] = parts;
  const instant = new Date(
    `${calendarDay}T${hours.padStart(2, '0')}:${minutes}:${seconds ?? '00'}${sign}${offsetHours}:${offsetMinutes}`
  );

  return isNaN(instant.getTime()) ? undefined : instant;
}
