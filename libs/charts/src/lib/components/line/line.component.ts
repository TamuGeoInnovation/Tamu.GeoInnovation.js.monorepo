import { Component, forwardRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

import { BaseChartComponent } from '../base/base.component';
import { count } from '../../operators/common/common-chart-operators';

@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['../base/base.component.scss', './line.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => LineChartComponent) }]
})
export class LineChartComponent extends BaseChartComponent implements AfterViewInit {
  public test: Subject<any> = new Subject();

  constructor() {
    super();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();

    // Simple test data reducer
    this.chartData = this.source.pipe(
      scan((acc, curr) => {
        return count(curr, this.xPath);
      }, [])
    );

    this.chart.create(this.chartData);
  }
}
