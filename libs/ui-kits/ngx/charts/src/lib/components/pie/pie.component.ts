import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { ArcElement, PieController, Chart } from 'chart.js';

import { BaseChartComponent } from '../base/base.component';
import { PieChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

// What a pie chart draws, registered here so an app that never draws one does not bundle it.
Chart.register(ArcElement, PieController);

@Component({
  selector: 'tamu-gisc-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['../base/base.component.scss', './pie.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => PieChartComponent) }],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ChartContainerComponent]
})
export class PieChartComponent extends BaseChartComponent implements AfterViewInit {
  constructor() {
    super();
  }

  public ngAfterViewInit() {
    this.baseConfig = new PieChartConfiguration();
    super.ngAfterViewInit();
  }
}
