import { Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  Chart,
  ChartConfiguration as ChartJsConfiguration,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  Legend,
  Title,
  Tooltip
} from 'chart.js';
// A default import: deepmerge is CommonJS whose export is the function itself, and a namespace import
// is not callable under Vitest's ES module interop (#1479). esModuleInterop is on workspace-wide.
import deepMerge from 'deepmerge';

// Every chart type shows a legend, tooltips and an optional title. Each chart component registers its own controller,
// elements and scales, so an app bundles only the chart types it uses.
Chart.register(Legend, Title, Tooltip);

/**
 * ColorBrewer's Paired palette, 12 colours: the default of chartjs-plugin-colorschemes, which coloured these charts
 * until chart.js 4, which that plugin does not support (#1218).
 */
export const CHART_COLORS = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928'
];

/** A colour at the given opacity, as chartjs-plugin-colorschemes made its fills. */
function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Colours each dataset the caller left uncoloured, by the plugin's rules: a line or radar gets the colour as its border
 * and points and a half-transparent fill, a pie or doughnut one colour per slice, anything else (a bar) its fill.
 */
export function applyChartColors(type: ChartType, data: ChartData) {
  (data?.datasets ?? []).forEach((dataset: ChartDataset & Record<string, unknown>, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];

    if (type === 'line' || type === 'radar' || type === 'scatter') {
      dataset.backgroundColor ??= withAlpha(color, 0.5);
      dataset.borderColor ??= color;
      dataset['pointBackgroundColor'] ??= withAlpha(color, 0.5);
      dataset['pointBorderColor'] ??= color;
    } else if (type === 'pie' || type === 'doughnut' || type === 'polarArea') {
      dataset.backgroundColor ??= dataset.data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    } else {
      dataset.backgroundColor ??= color;
    }
  });
}

@Component({
  selector: 'tamu-gisc-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnDestroy {
  public readonly container = viewChild<ElementRef>('chartContainer');

  private _chart: Chart<ChartType>;
  private _$destroy: Subject<boolean> = new Subject();

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public create(config?: Observable<ChartConfiguration> | ChartConfiguration) {
    if (config && config instanceof Observable) {
      // Handle observable data sources
      config.pipe(takeUntil(this._$destroy)).subscribe((c) => {
        this.createOrUpdate(c);
      });
    } else if (config && config instanceof ChartConfiguration) {
      this.createOrUpdate(config);
    }
  }

  private createOrUpdate(config: ChartConfiguration) {
    applyChartColors(config.type, config.data);

    if (this._chart === undefined) {
      // Handle observable data sources
      this._chart = new Chart((<HTMLCanvasElement>this.container().nativeElement).getContext('2d'), config as ChartJsConfiguration);
    } else {
      (this._chart.config as ChartJsConfiguration).type = config.type;
      this._chart.data = config.data;

      this._chart.update();
    }
  }
}

export class ChartConfiguration {
  public type: IChartConfiguration['type'];

  public data: IChartConfiguration['data'];

  public options: IChartConfiguration['options'];

  constructor(args?: IChartConfiguration) {
    if (args && args.data) {
      this.data = args.data;
    }

    this.options = {};
  }

  public updateData(data: IChartConfiguration['data']) {
    this.data = data;
  }

  public mergeOptions(opts: IChartConfiguration['options']) {
    const merged = deepMerge(this.options, opts);

    this.options = merged;
  }
}

export class BarChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'bar';
  }
}

export class LineChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'line';
  }
}

export class DoughnutChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'doughnut';
  }
}

export class PieChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'pie';
  }
}

export interface IChartConfiguration {
  type?: ChartType;
  data?: ChartData;
  options?: IChartConfigurationOptions;
}

export type IChartConfigurationOptions = ChartOptions;
