export function dateForDateTimeString(time: string, baseDate?: Date): Date {
  const tilde_offset = time.startsWith('~') ? 1 : 0;
  const hours = parseInt(time.substr(tilde_offset, 2), 10);
  const minutes = parseInt(time.substr(tilde_offset + 3, 2), 10);
  const is_afternoon = time.substr(tilde_offset + 6) === 'PM';
  const date = baseDate == null ? new Date() : new Date(baseDate);
  date.setHours(hours + (is_afternoon && hours !== 12 ? 12 : 0), minutes, 0);
  return date;
}

export function timeStringForDate(date: Date): string {
  let hours = date.getHours();
  let ampm = 'AM';
  if (hours > 12) {
    hours -= 12;
    ampm = 'PM';
  }
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}

/**
 * An event date as epoch milliseconds. Date-only strings (`YYYY-MM-DD`) are read as local midnight, not
 * UTC midnight: `new Date('2026-10-02')` is 1 October 19:00 in College Station, which made event maps
 * call a 2 October event over on the evening of the 1st (#1298).
 */
export function parseEventDate(date: string | Date | number): number {
  if (typeof date === 'number') {
    return date;
  }

  if (date instanceof Date) {
    return date.getTime();
  }

  const dateOnly = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;

    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  return new Date(date).getTime();
}

/**
 * Whether an event is over: its last date's whole local day has ended, and then `graceDays` more full
 * days. With no grace, an event on 2 October is over from midnight on 3 October; with one day, from
 * midnight on 4 October. No dates, or none that parse, means it has not passed.
 */
export function eventHasPassed(
  dates: Array<string | Date | number> | undefined,
  now: number = Date.now(),
  graceDays = 0
): boolean {
  const parsed = (dates || []).map(parseEventDate).filter((time) => !isNaN(time));

  if (parsed.length === 0) {
    return false;
  }

  // Midnight after the last date, then the grace days, in local time: setDate keeps this right across
  // a daylight-saving change, where adding 24 hours of milliseconds would not.
  const over = new Date(Math.max(...parsed));

  over.setHours(0, 0, 0, 0);
  over.setDate(over.getDate() + 1 + graceDays);

  return now >= over.getTime();
}

/**
 * An event's next date: the soonest one whose whole local day has not yet ended, as epoch milliseconds,
 * or `null` when every date is over. An event is on all day on each of its dates, so one dated today is
 * still next at a minute to midnight (#1301).
 */
export function nextEventDate(dates: Array<string | Date | number> | undefined, now: number = Date.now()): number | null {
  const startOfToday = new Date(now);

  startOfToday.setHours(0, 0, 0, 0);

  const remaining = (dates || []).map(parseEventDate).filter((time) => !isNaN(time) && time >= startOfToday.getTime());

  return remaining.length > 0 ? Math.min(...remaining) : null;
}
