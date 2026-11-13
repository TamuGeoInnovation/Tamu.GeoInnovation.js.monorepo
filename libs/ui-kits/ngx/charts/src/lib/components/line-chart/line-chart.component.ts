import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';

import { ChartBand, ChartSeries, LineChartOptions, withColors } from '../../data/chart-data';
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
      unit: this.unit()
    };
  });

  private readonly plot = viewChild<ElementRef<HTMLElement>>('plot');

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

      this.draw(host, options).then((d) => {
        if (gone) {
          d();
        } else {
          dispose = d;
        }
      });

      onCleanup(() => {
        gone = true;
        dispose?.();
      });
    });
  }
}
