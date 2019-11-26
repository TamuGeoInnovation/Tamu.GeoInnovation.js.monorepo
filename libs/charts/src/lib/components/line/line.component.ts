import { Component, forwardRef, AfterViewInit } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { LineChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['../base/base.component.scss', './line.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => LineChartComponent) }]
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
