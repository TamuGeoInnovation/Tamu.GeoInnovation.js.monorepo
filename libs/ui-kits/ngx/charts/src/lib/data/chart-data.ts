/** One point on a line or bar: `x` a time, `y` a value. */
export interface ChartPoint {
  x: Date;
  y: number;
}

export interface ChartSeries {
  label: string;
  points: Array<ChartPoint>;
  /** Any CSS colour. Defaults to the next of DEFAULT_SERIES_COLORS. */
  color?: string;
  /**
   * How many days later than they happened its points are drawn: set by alignToAnchor, so one season's line can be drawn
   * on another's days (#3215). The hover text then gives each point's own date.
   */
  shiftDays?: number;
}

/** A series with its colour filled in. */
export type ColoredSeries = ChartSeries & { color: string };

/** A shaded stretch of time, such as the days an event runs. `to` is the end of the last day shaded. */
export interface ChartBand {
  from: Date;
  to: Date;
  label: string;
}

/** Aggie maroon first, then colours that stay apart from it and from each other. */
export const DEFAULT_SERIES_COLORS = ['#500000', '#2c7fb8', '#d95f02', '#707373'];

/** What a chart drawer is given: everything resolved, colours included. */
export interface LineChartOptions {
  series: Array<ColoredSeries>;
  /** Drawn as pale columns in a short panel under the lines, on their own scale. */
  bars: ColoredSeries | null;
  bands: Array<ChartBand>;
  steps: boolean;
  /** What a value is a count of, for the hover text: "RSVPs" reads "1,003 RSVPs". */
  unit: string;
  /**
   * What each point stands for (#3314): a calendar day, or one hour of one, each placed at that day and hour in UTC as a
   * day is placed at its midnight. The axis, its labels and its hover text follow it.
   */
  interval: ChartInterval;
  /**
   * The day the x-axis counts from, or null for dates (#3215). When set, the axis reads in days before and after it
   * ("-7", "0", "+3") rather than dates, for lines of several seasons drawn on one season's days.
   */
  anchor: Date | null;
}

/** How much time one point stands for: a day, or an hour (#3314). */
export type ChartInterval = 'day' | 'hour';

/** The series with each one's colour filled in. */
export function withColors(series: Array<ChartSeries>): Array<ColoredSeries> {
  return series.map((s, i) => ({ ...s, color: s.color ?? DEFAULT_SERIES_COLORS[i % DEFAULT_SERIES_COLORS.length] }));
}

/** The calendar day of `date` in `timeZone`, as YYYY-MM-DD. */
export function dayIn(date: Date, timeZone: string): string {
  // en-CA writes dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** How many of `times` fall on each day, in `timeZone`, each day placed at midnight UTC of that calendar day. */
export function countsByDay(times: Array<Date | string>, timeZone = 'America/Chicago'): Array<ChartPoint> {
  const perDay = new Map<string, number>();

  for (const time of times) {
    const day = dayIn(new Date(time), timeZone);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }

  return [...perDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, y]) => ({ x: new Date(`${day}T00:00:00Z`), y }));
}

/**
 * The running total of `times` at the end of each day they fall on, in `timeZone`: one point per day with any, each
 * at midnight UTC of that calendar day, so the chart labels them as the days they are.
 */
export function runningTotalByDay(times: Array<Date | string>, timeZone = 'America/Chicago'): Array<ChartPoint> {
  let total = 0;

  return countsByDay(times, timeZone).map((p) => ({ x: p.x, y: (total += p.y) }));
}

/**
 * `points`, one per calendar day (each at midnight UTC) from the first to the last, so a chart has a value to show on
 * every day: a day with no point holds the day before's value (`'hold'`, for a running total) or is zero (`'zero'`, for
 * a day's count).
 */
export function everyDay(points: Array<ChartPoint>, fill: 'hold' | 'zero'): Array<ChartPoint> {
  return everyStep(points, fill, 24 * 60 * 60 * 1000);
}

/** `points`, one every `step` milliseconds from the first to the last, filled as everyDay fills a day (#3314). */
export function everyStep(points: Array<ChartPoint>, fill: 'hold' | 'zero', step: number): Array<ChartPoint> {
  if (points.length === 0) {
    return [];
  }

  const sorted = [...points].sort((a, b) => a.x.getTime() - b.x.getTime());
  const byDay = new Map(sorted.map((p) => [p.x.getTime(), p.y]));
  const out: Array<ChartPoint> = [];
  let last = 0;

  for (let t = sorted[0].x.getTime(); t <= sorted[sorted.length - 1].x.getTime(); t += step) {
    const y = byDay.get(t) ?? (fill === 'hold' ? last : 0);
    out.push({ x: new Date(t), y });
    last = y;
  }

  return out;
}

/** The calendar days `times` cover in `timeZone`, from the first's midnight to the end of the last, as a band. */
export function bandOfDays(times: Array<Date | string>, label: string, timeZone = 'America/Chicago'): ChartBand | null {
  const days = times.map((t) => dayIn(new Date(t), timeZone)).sort();

  if (days.length === 0) {
    return null;
  }

  const to = new Date(`${days[days.length - 1]}T00:00:00Z`);
  to.setUTCDate(to.getUTCDate() + 1);

  return { from: new Date(`${days[0]}T00:00:00Z`), to, label };
}

const DAY = 24 * 60 * 60 * 1000;

/** Midnight UTC of a YYYY-MM-DD calendar day, as every point is placed. */
function midnightOf(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/**
 * The day a season's lines are lined up on (#3215): the Monday that starts the calendar week holding most of its
 * `days`, in `timeZone`, at midnight UTC of that day, or null for no days. Its week rather than its first day, because
 * a season can list a stray day outside its week (2023 lists 10, 12 and 30 November), and a week's Monday stays the same
 * weekday every year. With a tie, the earlier week.
 */
export function weekAnchor(days: Array<Date | string>, timeZone = 'America/Chicago'): Date | null {
  const perWeek = new Map<number, number>();

  for (const time of days) {
    const day = midnightOf(dayIn(new Date(time), timeZone));
    // getUTCDay() is 0 on Sunday: a Sunday belongs to the week that started the Monday before.
    const monday = day.getTime() - ((day.getUTCDay() + 6) % 7) * DAY;
    perWeek.set(monday, (perWeek.get(monday) ?? 0) + 1);
  }

  const weeks = [...perWeek.entries()].sort(([a, n], [b, m]) => m - n || a - b);

  return weeks.length ? new Date(weeks[0][0]) : null;
}

/** Whole days from `anchor` to `date`, both at midnight UTC of their days: negative before it. */
export function daysFrom(anchor: Date, date: Date): number {
  return Math.round((date.getTime() - anchor.getTime()) / DAY);
}

/** A day counted from an anchor, as an axis reads it: "-7", "0", "+3", with a true minus sign. */
export function relativeDayLabel(days: number): string {
  return days === 0 ? '0' : days < 0 ? `−${-days}` : `+${days}`;
}

/**
 * `series` drawn on another season's days (#3215): every point moved by the whole days from its season's anchor `from`
 * to the other's `to`, so the two anchors fall on the same x. Points from `until` on are left out, when it is given.
 */
export function alignToAnchor(series: ChartSeries, from: Date, to: Date, until: Date | null = null): ChartSeries {
  const shift = daysFrom(from, to);

  return {
    ...series,
    points: series.points
      .filter((p) => !until || p.x.getTime() < until.getTime())
      .map((p) => ({ x: new Date(p.x.getTime() + shift * DAY), y: p.y })),
    shiftDays: (series.shiftDays ?? 0) + shift
  };
}

/**
 * Where an axis counted from `anchor` puts its ticks (#3215): whole steps out from the anchor in both directions, so the
 * anchor itself is always one, between `min` and `max` (times). The step is the shortest of a day, a week, two weeks,
 * four or eight that leaves `minGap` pixels between ticks across `width`.
 */
export function anchorTicks(anchor: Date, min: number, max: number, width: number, minGap = 55): Array<number> {
  const span = Math.max(max - min, DAY);
  const pxPerDay = width / (span / DAY);
  const step = ([1, 7, 14, 28, 56].find((days) => days * pxPerDay >= minGap) ?? 56) * DAY;
  const first = anchor.getTime() + Math.ceil((min - anchor.getTime()) / step) * step;
  const ticks: Array<number> = [];

  for (let t = first; t <= max; t += step) {
    ticks.push(t);
  }

  return ticks;
}

const HOUR = 60 * 60 * 1000;

/** The calendar day and hour of `date` in `timeZone`, as YYYY-MM-DDTHH, the hour from 00 to 23. */
export function hourIn(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00';

  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}`;
}

/**
 * How many of `times` fall in each hour of the calendar days `days` cover, in `timeZone` (#3314): every hour from the
 * first day's midnight to the end of the last, an hour with none as zero, each placed at that hour UTC of its day, as
 * countsByDay places a day. Times on other days are left out. Nothing for no days.
 */
export function countsByHourOver(
  times: Array<Date | string>,
  days: Array<Date | string>,
  timeZone = 'America/Chicago'
): Array<ChartPoint> {
  const band = bandOfDays(days, '', timeZone);

  if (!band) {
    return [];
  }

  const perHour = new Map<number, number>();

  for (const time of times) {
    const hour = new Date(`${hourIn(new Date(time), timeZone)}:00:00Z`).getTime();
    perHour.set(hour, (perHour.get(hour) ?? 0) + 1);
  }

  const points: Array<ChartPoint> = [];

  for (let t = band.from.getTime(); t < band.to.getTime(); t += HOUR) {
    points.push({ x: new Date(t), y: perHour.get(t) ?? 0 });
  }

  return points;
}
