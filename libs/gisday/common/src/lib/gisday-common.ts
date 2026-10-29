export enum COMPETITION_VALIDATION_STATUS {
  unverified = 'unverified',
  verified = 'verified',
  discarded = 'discarded'
}

/**
 * The most of a phone's reported accuracy, in metres, that counts towards reaching a location's
 * check-in zone (#1766). An attendee counts as inside when the circle their phone reports, their
 * position with its accuracy as the radius, touches the zone.
 *
 * A phone with GPS usually reports a few metres to a few tens of metres, and more indoors, so 100 m
 * lets in an attendee deep inside a large building like the Memorial Student Center. A position
 * from cell towers alone can report kilometres; the cap means a position that vague cannot reach
 * the zone from across town.
 */
export const CHECK_IN_MAX_ACCURACY = 100;

/**
 * The one event mode whose check-in needs the attendee inside its location's zone. Hybrid and
 * virtual events can be attended online.
 */
export const CHECK_IN_ZONE_EVENT_MODE = 'in-person';

/**
 * What an attendee outside the zone is told.
 *
 * @param venue The location's name, such as "TAMU Rudder Plaza", when it has one.
 */
export function checkInZoneMessage(venue?: string): string {
  return venue
    ? `You need to be inside the check-in zone at ${venue} to check in to this event.`
    : 'You need to be inside the check-in zone for this event to check in.';
}

/**
 * The event modes an attendee checks in to only with the session's QR code (#2560): the code the
 * presenter shows on a slide. Their attendees may be anywhere, so the check-in zone cannot tell who
 * is attending, and without the code anyone signed in could check in from the session page.
 */
export const CHECK_IN_CODE_EVENT_MODES: ReadonlyArray<string> = ['hybrid', 'virtual'];

/**
 * Whether checking in to an event with this mode needs the session's QR code.
 */
export function checksInByCode(mode: string | undefined | null): boolean {
  return CHECK_IN_CODE_EVENT_MODES.includes(mode);
}

/**
 * The query parameter the QR code's link puts the code in: `/sessions/details/<guid>?checkin=<code>`.
 */
export const CHECK_IN_CODE_PARAM = 'checkin';

/**
 * What an attendee checking in to a QR session without its code, or with another session's, is told.
 */
export const CHECK_IN_CODE_MESSAGE = "Check in to this session by scanning the QR code on the presenter's slides.";

/**
 * Minutes after a session's end that check-in stays open, for attendees who check in late.
 */
export const CHECK_IN_GRACE_MINUTES = 15;

/**
 * The time zone GIS Day's days belong to: a session's day is the calendar date there.
 */
const GISDAY_TIME_ZONE = 'America/Chicago';

/**
 * When check-in to a session opens and closes: from its start until `CHECK_IN_GRACE_MINUTES` after its
 * end (#1795). The session page shows the Check In button in this window, and the API refuses an
 * attendee's check-in outside it, so the two cannot disagree. Organizers adding a check-in are exempt.
 *
 * @param day The session's day, `SeasonDay.date`: its calendar date in Central time is the day.
 * @param startTime The session's start as stored, `16:00:00 GMT-0600 (Central Standard Time)`. The
 * offset, when present, is honoured, as the page always has; without one the time is Central time.
 * @param endTime The session's end, the same way.
 * @returns `null` when the day or either time is missing or cannot be read: such a session is never
 * open for check-in (#1772).
 */
export function checkInWindow(
  day: Date | string | undefined | null,
  startTime: string | undefined | null,
  endTime: string | undefined | null
): { opens: Date; closes: Date } | null {
  if (!day || !startTime || !endTime) {
    return null;
  }

  const date = new Date(day);

  if (isNaN(date.getTime())) {
    return null;
  }

  const calendarDay = centralParts(date);
  const opens = atTime(calendarDay, startTime);
  const closes = atTime(calendarDay, endTime);

  if (!opens || !closes) {
    return null;
  }

  closes.setMinutes(closes.getMinutes() + CHECK_IN_GRACE_MINUTES);

  return { opens, closes };
}

/**
 * Whether check-in to a session is open at `now`. See `checkInWindow`.
 */
export function isCheckInOpen(
  session: { day?: { date?: Date | string } | null; startTime?: string | null; endTime?: string | null },
  now: Date = new Date()
): boolean {
  const window = checkInWindow(session?.day?.date, session?.startTime, session?.endTime);

  return window !== null && now >= window.opens && now <= window.closes;
}

/**
 * The year, month and day of an instant in Central time.
 */
function centralParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: GISDAY_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);

  return { year: part('year'), month: part('month'), day: part('day') };
}

/**
 * The instant a stored time (`HH:mm[:ss][ GMT±hhmm ...]`) falls on a Central calendar day.
 */
function atTime(day: { year: number; month: number; day: number }, time: string): Date | null {
  const parts = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*GMT([+-])(\d{2})(\d{2}))?/.exec(time.trim());

  if (!parts) {
    return null;
  }

  const [, hours, minutes, seconds, sign, offsetHours, offsetMinutes] = parts;
  const wallClock = Date.UTC(day.year, day.month - 1, day.day, Number(hours), Number(minutes), Number(seconds ?? 0));

  if (Number(hours) > 23 || Number(minutes) > 59) {
    return null;
  }

  // With a stored offset, the wall-clock time is in that offset; without one, in Central time.
  const offsetMs = sign
    ? (sign === '-' ? -1 : 1) * (Number(offsetHours) * 60 + Number(offsetMinutes)) * 60000
    : centralOffsetMs(new Date(wallClock));

  return new Date(wallClock - offsetMs);
}

/**
 * Central time's offset from UTC, in milliseconds, near an instant: -6 h in winter, -5 h in summer.
 */
function centralOffsetMs(near: Date): number {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: GISDAY_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).formatToParts(near);
  const part = (type: string) => Number(p.find((x) => x.type === type)?.value);
  const asUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));

  return asUtc - Math.floor(near.getTime() / 60000) * 60000;
}
