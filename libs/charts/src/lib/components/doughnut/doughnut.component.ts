import { Component, forwardRef, AfterViewInit } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { DoughnutChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  selector: 'tamu-gisc-doughnut-chart',
  templateUrl: './doughnut.component.html',
  styleUrls: ['../base/base.component.scss', './doughnut.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => DoughnutChartComponent) }]
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
