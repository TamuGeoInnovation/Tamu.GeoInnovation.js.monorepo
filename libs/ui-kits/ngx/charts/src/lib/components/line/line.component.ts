import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { CategoryScale, Filler, LineController, LineElement, LinearScale, PointElement, Chart } from 'chart.js';

import { BaseChartComponent } from '../base/base.component';
import { LineChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

// What a line chart draws, registered here so an app that never draws one does not bundle it.
Chart.register(CategoryScale, Filler, LineController, LineElement, LinearScale, PointElement);

@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['../base/base.component.scss', './line.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => LineChartComponent) }],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ChartContainerComponent]
})
export class LineChartComponent extends BaseChartComponent implements AfterViewInit {
  constructor() {
    super();
  }

  public ngAfterViewInit() {
    this.baseConfig = new LineChartConfiguration();

    super.ngAfterViewInit();
  }
}
