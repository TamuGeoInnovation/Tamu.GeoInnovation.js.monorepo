/**
 * US Central time, where GIS Day is (#3323): the one place its zone, its calendar days and its formatting live. The zone
 * was written out in about ten files, and the calendar day worked out three times, with two different daylight-saving
 * calculations.
 */
export const GISDAY_TIME_ZONE = 'America/Chicago';

/** Newer ICU puts a narrow no-break space before AM and PM; every caller prints a plain one. */
const NARROW_NO_BREAK_SPACE = /\u202f/g;

/**
 * `date` in Central time, in the parts `style` asks for (any `Intl.DateTimeFormat` options but the zone), in US English:
 * "Nov 16, 4:05 PM". Before AM and PM it has a plain space, whatever the ICU version.
 */
export function formatCentral(date: Date | string | number, style: Omit<Intl.DateTimeFormatOptions, 'timeZone'>): string {
  return new Intl.DateTimeFormat('en-US', { ...style, timeZone: GISDAY_TIME_ZONE })
    .format(new Date(date))
    .replace(NARROW_NO_BREAK_SPACE, ' ');
}

/** The calendar day an instant falls on in Central time, as YYYY-MM-DD, which sorts and compares as text. */
export function centralDay(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: GISDAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

/**
 * The instant a Central wall-clock time falls on a Central calendar day: `day` as YYYY-MM-DD, `time` as HH:mm[:ss],
 * midnight by default. In standard time and daylight time alike: midnight on 1 November 2026 is 05:00 UTC, still
 * daylight time, and on 8 March 06:00 UTC, still standard time.
 */
export function centralInstant(day: string, time = '00:00'): Date {
  const [year, month, date] = day.split('-').map(Number);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const wallClock = Date.UTC(year, month - 1, date, hours, minutes, seconds || 0);

  return new Date(wallClock - centralOffsetMs(new Date(wallClock)));
}

/** Central time's offset from UTC, in milliseconds, near an instant: -6 h in winter, -5 h in summer. */
export function centralOffsetMs(near: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: GISDAY_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).formatToParts(near);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));

  return asUtc - Math.floor(near.getTime() / 60000) * 60000;
}
