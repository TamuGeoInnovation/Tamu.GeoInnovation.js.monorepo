import { Component, forwardRef, AfterViewInit } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { BarChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  selector: 'tamu-gisc-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['../base/base.component.scss', './bar.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => BarChartComponent) }]
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
