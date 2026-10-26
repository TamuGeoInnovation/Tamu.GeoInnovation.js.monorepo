import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { ArcElement, DoughnutController, Chart } from 'chart.js';

import { BaseChartComponent } from '../base/base.component';
import { DoughnutChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

// What a doughnut chart draws, registered here so an app that never draws one does not bundle it.
Chart.register(ArcElement, DoughnutController);

@Component({
  selector: 'tamu-gisc-doughnut-chart',
  templateUrl: './doughnut.component.html',
  styleUrls: ['../base/base.component.scss', './doughnut.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => DoughnutChartComponent) }],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ChartContainerComponent]
})
export class DoughnutChartComponent extends BaseChartComponent implements AfterViewInit {
  constructor() {
    super();
  }

  public ngAfterViewInit() {
    this.baseConfig = new DoughnutChartConfiguration();

    super.ngAfterViewInit();
  }
}
