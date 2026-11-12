import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** One point on a line: `x` a time, `y` a value. */
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

/** Aggie maroon first, then colours that stay apart from it and from each other. */
export const DEFAULT_SERIES_COLORS = ['#500000', '#2c7fb8', '#d95f02', '#707373'];

const WIDTH = 640;
const HEIGHT = 260;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 44 };
const DAY = 24 * 60 * 60 * 1000;

/** Round ticks from 0 to at least `max`: steps of 1, 2 or 5 times a power of ten, about `count` of them. */
export function niceTicks(max: number, count = 5): Array<number> {
  if (!(max > 0)) {
    return [0, 1];
  }

  const rough = max / count;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? 10 * power;
  // Whole-number ticks: a count of people is never 2.5.
  const whole = Math.max(1, Math.round(step));
  const ticks: Array<number> = [];

  for (let t = 0; t < max + whole; t += whole) {
    ticks.push(t);

    if (t >= max) {
      break;
    }
  }

  return ticks;
}

/** The calendar day of `date` in `timeZone`, as YYYY-MM-DD. */
export function dayIn(date: Date, timeZone: string): string {
  // en-CA writes dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/**
 * The running total of `times` at the end of each day they fall on, in `timeZone`: one point per day with any, each
 * at midnight UTC of that calendar day, so the chart labels them as the days they are.
 */
export function runningTotalByDay(times: Array<Date | string>, timeZone = 'America/Chicago'): Array<ChartPoint> {
  const perDay = new Map<string, number>();

  for (const time of times) {
    const day = dayIn(new Date(time), timeZone);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }

  let total = 0;

  return [...perDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => {
      total += count;

      return { x: new Date(`${day}T00:00:00Z`), y: total };
    });
}

/**
 * A line chart drawn as SVG, with no chart library: each series a line through its points, a round scale from zero,
 * dated ticks along the bottom, and a legend when there is more than one series. Each point names its date and value
 * on hover. First used for GIS Day's RSVPs over time (#2878).
 */
@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  public readonly series = input.required<Array<ChartSeries>>();
  /** What the chart shows, read by a screen reader. */
  public readonly label = input<string>('Chart');
  /** Draw each line as steps, which suits a running total: it holds its value until the next point. */
  public readonly steps = input<boolean>(false);

  public readonly width = WIDTH;
  public readonly height = HEIGHT;
  public readonly margin = MARGIN;

  private readonly withColors = computed(() =>
    this.series().map((s, i) => ({ ...s, color: s.color ?? DEFAULT_SERIES_COLORS[i % DEFAULT_SERIES_COLORS.length] }))
  );

  private readonly xDomain = computed(() => {
    const times = this.series().flatMap((s) => s.points.map((p) => p.x.getTime()));

    if (times.length === 0) {
      return [0, DAY];
    }

    const min = Math.min(...times);
    const max = Math.max(...times);

    // A single day still needs a width to draw across.
    return max > min ? [min, max] : [min - DAY / 2, max + DAY / 2];
  });

  public readonly yTicks = computed(() => niceTicks(Math.max(0, ...this.series().flatMap((s) => s.points.map((p) => p.y)))));

  public readonly isEmpty = computed(() => this.series().every((s) => s.points.length === 0));

  public readonly xTicks = computed(() => {
    const [min, max] = this.xDomain();
    const days = Math.max(1, Math.round((max - min) / DAY));
    const every = Math.max(1, Math.ceil(days / 6));
    const first = Math.ceil(min / DAY) * DAY;
    const ticks: Array<{ x: number; text: string }> = [];

    for (let t = first; t <= max; t += every * DAY) {
      ticks.push({ x: this.xOf(t), text: dateText(new Date(t)) });
    }

    return ticks;
  });

  public readonly lines = computed(() =>
    this.withColors().map((s) => {
      const points = s.points.map((p) => ({
        x: this.xOf(p.x.getTime()),
        y: this.yOf(p.y),
        title: `${s.label}, ${dateText(p.x)}: ${p.y}`
      }));

      return { label: s.label, color: s.color, points, path: this.pathOf(points) };
    })
  );

  public yOf(value: number): number {
    const ticks = this.yTicks();
    const top = ticks[ticks.length - 1];

    return MARGIN.top + (HEIGHT - MARGIN.top - MARGIN.bottom) * (1 - value / top);
  }

  public xOf(time: number): number {
    const [min, max] = this.xDomain();

    return MARGIN.left + ((WIDTH - MARGIN.left - MARGIN.right) * (time - min)) / (max - min);
  }

  private pathOf(points: Array<{ x: number; y: number }>): string {
    return points
      .map((p, i) => {
        if (i === 0) {
          return `M${round(p.x)} ${round(p.y)}`;
        }

        return this.steps() ? `H${round(p.x)}V${round(p.y)}` : `L${round(p.x)} ${round(p.y)}`;
      })
      .join('');
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** A tick's date, as the day it is in UTC: runningTotalByDay places each day at its UTC midnight. */
function dateText(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(date);
}
