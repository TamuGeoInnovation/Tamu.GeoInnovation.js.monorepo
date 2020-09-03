import { Component, forwardRef, AfterViewInit } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { PieChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  selector: 'tamu-gisc-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['../base/base.component.scss', './pie.component.scss']
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
