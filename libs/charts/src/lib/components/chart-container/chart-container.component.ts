import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Chart } from 'chart.js';
import * as deepMerge from 'deepmerge';
import 'chartjs-plugin-colorschemes';

@Component({
  selector: 'tamu-gisc-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnDestroy {
  @ViewChild('chartContainer', { static: true })
  public container: ElementRef;

  private _chart: Chart;
  private _$destroy: Subject<boolean> = new Subject();

  constructor() {}

  public ngOnDestroy() {
    this._$destroy.next();
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
    if (this._chart === undefined) {
      // Handle observable data sources
      this._chart = new Chart((<HTMLCanvasElement>this.container.nativeElement).getContext('2d'), config);
    } else {
      this._chart.config.type = config.type;
      this._chart.config.data = config.data;

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

export class PieChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'pie';
  }
}

export interface IChartConfiguration extends Chart.ChartConfiguration {
  type?: Chart.ChartType;
  data?: Chart.ChartData;
  options?: IChartConfigurationOptions;
  plugins?: Chart.PluginServiceRegistrationOptions[];
}

export interface IChartConfigurationOptions extends Chart.ChartOptions {
  plugins?: {
    colorschemes?: {
      /**
       * Full color scheme list found @ https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
       *
       * Demos @ https://nagix.github.io/chartjs-plugin-colorschemes/
       */
      scheme: string;
    };
  };
}
