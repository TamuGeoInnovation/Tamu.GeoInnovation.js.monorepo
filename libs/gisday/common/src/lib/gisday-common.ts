import { centralDay, centralInstant, formatCentral } from './central-time';
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
  return typeof mode === 'string' && CHECK_IN_CODE_EVENT_MODES.includes(mode);
}

/**
 * The query parameter the QR code's link puts the code in: `/sessions/details/<guid>?checkin=<code>`.
 */
export const CHECK_IN_CODE_PARAM = 'checkin';

/**
 * Where the page keeps a check-in code it took out of the address, followed by that address's path (#2572), so Analytics
 * and the browser's history never have it. gisday-angular's `index.html` writes it, before the app starts, under this
 * same name.
 */
export const CHECK_IN_CODE_KEPT = 'gisday-checkin-code:';

/**
 * What an attendee checking in to a QR session without its code, or with another session's, is told.
 */
export const CHECK_IN_CODE_MESSAGE = "Check in to this session by scanning the QR code on the presenter's slides.";

/**
 * What admins see beside a check-in made outside its session's time, which a session open at any time
 * allows (#2635).
 */
export const OUTSIDE_SESSION_TIME_LABEL = 'Outside Session Time Check-In';

/**
 * Minutes before a session's start that check-in opens, unless the session sets its own (#3209).
 */
export const CHECK_IN_MINUTES_BEFORE = 5;

/**
 * Minutes after a session's end that check-in stays open, unless the session sets its own (#3209).
 */
export const CHECK_IN_MINUTES_AFTER = 10;

/**
 * The most either setting may be: a whole day. A larger window is what "open at any time" is for.
 */
export const CHECK_IN_MINUTES_MAX = 1440;

/**
 * A session's own check-in settings (#3209), as the `events` table stores them.
 */
export interface CheckInMinutes {
  checkInMinutesBefore?: number | string | null;
  checkInMinutesAfter?: number | string | null;
}

/**
 * A session's check-in minutes as whole numbers from 0 to `CHECK_IN_MINUTES_MAX`. A value that is missing or cannot
 * be read, such as an event saved before the settings existed, takes the default.
 */
export function checkInMinutes(session: CheckInMinutes | null | undefined): { before: number; after: number } {
  return {
    before: minutesSetting(session?.checkInMinutesBefore, CHECK_IN_MINUTES_BEFORE),
    after: minutesSetting(session?.checkInMinutesAfter, CHECK_IN_MINUTES_AFTER)
  };
}

/**
 * The problem with a check-in minutes setting as typed into the admin form, or `null` when it may be saved.
 *
 * @param label What the setting is called in the sentence, such as "Check-in opens".
 */
export function checkInMinutesProblem(value: unknown, label: string): string | null {
  return readMinutes(value) === null
    ? `${label} must be a whole number of minutes from 0 to ${CHECK_IN_MINUTES_MAX}.`
    : null;
}

function minutesSetting(value: unknown, fallback: number): number {
  return readMinutes(value) ?? fallback;
}

/**
 * A whole number of minutes from 0 to `CHECK_IN_MINUTES_MAX`, given as a number or as the text a number box holds, or
 * `null` for anything else.
 */
function readMinutes(value: unknown): number | null {
  const minutes = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

  return typeof minutes === 'number' && Number.isInteger(minutes) && minutes >= 0 && minutes <= CHECK_IN_MINUTES_MAX
    ? minutes
    : null;
}

/**
 * When check-in to a session opens and closes: from `before` minutes before its start until `after` minutes after its
 * end, by default 5 and 10, each set per session (#1795, #3209). The session page shows the Check In button in this
 * window, and the API refuses an attendee's check-in outside it, so the two cannot disagree. Organizers adding a
 * check-in are exempt.
 *
 * @param day The session's day, `SeasonDay.date`: its calendar date in Central time is the day.
 * @param startTime The session's start as stored, `16:00:00 GMT-0600 (Central Standard Time)`. The
 * offset, when present, is honoured, as the page always has; without one the time is Central time.
 * @param endTime The session's end, the same way.
 * @param minutes The session's own settings; either one left out takes the default.
 * @returns `null` when the day or either time is missing or cannot be read: such a session is never
 * open for check-in (#1772).
 */
export function checkInWindow(
  day: Date | string | undefined | null,
  startTime: string | undefined | null,
  endTime: string | undefined | null,
  minutes?: CheckInMinutes | null
): { opens: Date; closes: Date } | null {
  const opens = sessionTime(day, startTime);
  const closes = sessionTime(day, endTime);

  if (!opens || !closes) {
    return null;
  }

  const { before, after } = checkInMinutes(minutes);

  opens.setMinutes(opens.getMinutes() - before);
  closes.setMinutes(closes.getMinutes() + after);

  return { opens, closes };
}

/**
 * When a session's check-in opens, relative to its start, for the API's refusal: "when it starts", or "5 minutes before
 * it starts".
 */
export function checkInOpensRelative(session: CheckInMinutes | null | undefined): string {
  const { before } = checkInMinutes(session);

  return before === 0 ? 'when it starts' : `${before} ${before === 1 ? 'minute' : 'minutes'} before it starts`;
}

/**
 * The instant a session starts or ends: its stored time (`16:00:00 GMT-0600 (Central Standard Time)`) on its day's
 * calendar date in Central time. The same wherever the visitor is: a day arrives as midnight Central, which further
 * west is still the day before (#2710). The offset, when present, is honoured; without one the time is Central time.
 *
 * @returns `null` when the day or the time is missing or cannot be read (#1772).
 */
export function sessionTime(day: Date | string | undefined | null, time: string | undefined | null): Date | null {
  if (!day || !time) {
    return null;
  }

  const date = new Date(day);

  if (isNaN(date.getTime())) {
    return null;
  }

  return atTime(centralDay(date), time);
}

/**
 * Whether a GIS Day day is over at `now`: its calendar date in Central time is before today's there (#3221). Today has
 * not passed. The Sessions page collapses the days that have. A day that is missing or cannot be read has not passed.
 */
export function dayHasPassed(day: Date | string | undefined | null, now: Date = new Date()): boolean {
  const date = day ? new Date(day) : null;

  if (!date || isNaN(date.getTime())) {
    return false;
  }

  return centralDay(date) < centralDay(now);
}

/**
 * Whether check-in to a session is open at `now`. See `checkInWindow`.
 */
export function isCheckInOpen(
  session: { day?: { date?: Date | string } | null; startTime?: string | null; endTime?: string | null } & CheckInMinutes,
  now: Date = new Date()
): boolean {
  const window = checkInWindow(session?.day?.date, session?.startTime, session?.endTime, session);

  return window !== null && now >= window.opens && now <= window.closes;
}

/**
 * What a session's page says before its check-in opens (#3077): the time in Central, with the day when it is not
 * today in Central. An attendee who scans a QR code early learns why nothing happened, and when to scan again.
 */
export function checkInOpensMessage(opens: Date, now: Date = new Date()): string {
  return `Check-in opens ${checkInOpensAt(opens, now)}.`;
}

/**
 * When check-in opens, in Central time: "at 2:00 PM" on the same Central day as `now`, otherwise "on Wednesday,
 * November 18 at 2:00 PM". The page's message and the API's refusal both say it this way (#3077, #3089).
 */
export function checkInOpensAt(opens: Date, now: Date = new Date()): string {
  const time = formatCentral(opens, { hour: 'numeric', minute: '2-digit' });

  if (centralDay(opens) === centralDay(now)) {
    return `at ${time}`;
  }

  const day = formatCentral(opens, { weekday: 'long', month: 'long', day: 'numeric' });

  return `on ${day} at ${time}`;
}

/**
 * The instant a stored time (`HH:mm[:ss][ GMT±hhmm ...]`) falls on a Central calendar day (YYYY-MM-DD).
 */
function atTime(day: string, time: string): Date | null {
  const parts = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*GMT([+-])(\d{2})(\d{2}))?/.exec(time.trim());

  if (!parts) {
    return null;
  }

  const [, hours, minutes, seconds, sign, offsetHours, offsetMinutes] = parts;

  if (Number(hours) > 23 || Number(minutes) > 59) {
    return null;
  }

  if (!sign) {
    return centralInstant(day, `${hours}:${minutes}:${seconds ?? '00'}`);
  }

  // With a stored offset, the wall-clock time is in that offset.
  const [year, month, date] = day.split('-').map(Number);
  const wallClock = Date.UTC(year, month - 1, date, Number(hours), Number(minutes), Number(seconds ?? 0));
  const offsetMs = (sign === '-' ? -1 : 1) * (Number(offsetHours) * 60 + Number(offsetMinutes)) * 60000;

  return new Date(wallClock - offsetMs);
}
