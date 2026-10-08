import { Component, forwardRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';
import { LineChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

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
