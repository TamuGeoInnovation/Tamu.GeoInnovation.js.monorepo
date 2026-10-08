import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { DoughnutChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

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
