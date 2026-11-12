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
}

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
  series: Array<Required<ChartSeries>>;
  /** Drawn as pale columns in a short panel under the lines, on their own scale. */
  bars: Required<ChartSeries> | null;
  bands: Array<ChartBand>;
  steps: boolean;
  /** What a value is a count of, for the hover text: "RSVPs" reads "1,003 RSVPs". */
  unit: string;
}

/** The series with each one's colour filled in. */
export function withColors(series: Array<ChartSeries>): Array<Required<ChartSeries>> {
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
  if (points.length === 0) {
    return [];
  }

  const DAY = 24 * 60 * 60 * 1000;
  const sorted = [...points].sort((a, b) => a.x.getTime() - b.x.getTime());
  const byDay = new Map(sorted.map((p) => [p.x.getTime(), p.y]));
  const out: Array<ChartPoint> = [];
  let last = 0;

  for (let t = sorted[0].x.getTime(); t <= sorted[sorted.length - 1].x.getTime(); t += DAY) {
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
