import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { BarController, BarElement, CategoryScale, LinearScale, Chart } from 'chart.js';

import { BaseChartComponent } from '../base/base.component';
import { BarChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

// What a bar chart draws, registered here so an app that never draws one does not bundle it.
Chart.register(BarController, BarElement, CategoryScale, LinearScale);

@Component({
  selector: 'tamu-gisc-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['../base/base.component.scss', './bar.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => BarChartComponent) }],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ChartContainerComponent]
})
export class BarChartComponent extends BaseChartComponent implements AfterViewInit {
  constructor() {
    super();
  }

  public ngAfterViewInit() {
    this.baseConfig = new BarChartConfiguration();

    super.ngAfterViewInit();
  }
}
