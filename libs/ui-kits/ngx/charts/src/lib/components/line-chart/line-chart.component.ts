import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';

import { ChartBand, ChartInterval, ChartSeries, LineChartOptions, withColors } from '../../data/chart-data';
import { LINE_CHART_DRAWER } from './line-chart.drawer';

/**
 * A line chart over time, drawn with amCharts 5: each series a line, with its values on hover, an optional short panel
 * of columns under it (such as each day's new RSVPs), optional shaded stretches of time, and drag-to-zoom. First used
 * for GIS Day's RSVPs over time (#2878); drawn with amCharts since #2886.
 */
@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  private readonly draw = inject(LINE_CHART_DRAWER);

  public readonly series = input.required<Array<ChartSeries>>();
  /** What the chart shows, read by a screen reader. */
  public readonly label = input<string>('Chart');
  /** Draw each line as steps, which suits a running total: it holds its value until the next point. */
  public readonly steps = input<boolean>(false);
  /** Columns in a short panel under the lines, on their own scale. Coloured as the first line unless given one. */
  public readonly bars = input<ChartSeries | null>(null);
  /** Stretches of time to shade, each with its label. */
  public readonly bands = input<Array<ChartBand>>([]);
  /** What a value counts, for the hover text: 'RSVPs' reads "All events: 1,003 RSVPs". */
  public readonly unit = input<string>('');
  /**
   * The day the x-axis counts from (#3215): when given, the axis reads in days before and after it, and each line's
   * hover text gives its own date. For several seasons drawn on one's days, with alignToAnchor.
   */
  public readonly anchor = input<Date | null>(null);
  /**
   * What each point stands for: a day, or an hour of one (#3314), such as check-ins across GIS Day week. The axis is
   * labelled and hovered in the same.
   */
  public readonly interval = input<ChartInterval>('day');
  /** The chart's height in pixels. It does not grow with the page's width. */
  public readonly height = input<number>(320);

  public readonly isEmpty = computed(() => this.series().every((s) => s.points.length === 0));

  public readonly options = computed<LineChartOptions>(() => {
    const series = withColors(this.series());
    const bars = this.bars();

    return {
      series,
      bars: bars ? { ...bars, color: bars.color ?? series[0]?.color ?? '#500000' } : null,
      bands: this.bands(),
      steps: this.steps(),
      unit: this.unit(),
      anchor: this.anchor(),
      interval: this.interval()
    };
  });

  private readonly plot = viewChild<ElementRef<HTMLElement>>('plot');

  /**
   * The drawing under way, or the last one, settled. Each draw waits for it, so a drawing is disposed of before the next
   * begins: amCharts allows one Root on an element, and two draws started together both made theirs before either was
   * disposed (#3829).
   */
  private drawing: Promise<void> = Promise.resolve();

  constructor() {
    // Drawn again whenever what it shows changes; the last drawing is disposed of first.
    effect((onCleanup) => {
      const host = this.plot()?.nativeElement;
      const options = this.options();

      if (!host) {
        return;
      }

      let dispose: (() => void) | null = null;
      let gone = false;

      this.drawing = this.drawing
        .then(async () => {
          // Replaced before its turn came: there is nothing to draw, and drawing it would only be disposed of.
          if (gone) {
            return;
          }

          const d = await this.draw(host, options);

          if (gone) {
            d();
          } else {
            dispose = d;
          }
        })
        // A failed drawing must not stop the next one.
        .catch(() => undefined);

      onCleanup(() => {
        gone = true;
        dispose?.();
      });
    });
  }
}
