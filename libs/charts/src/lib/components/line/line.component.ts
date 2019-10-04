import { Component, forwardRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

import { op } from '../../operators/common/common-chart-operators';
import { BaseChartComponent } from '../base/base.component';
import { BarChartConfiguration } from '../chart-container/chart-container.component';

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

    this.baseConfig = new BarChartConfiguration();

    // Simple test data reducer
    this.chartData = this.source.pipe(
      scan((acc, curr) => {
        const counts = op.count(curr, this.path);

        this.baseConfig.updateData({
          labels: counts.labels,
          datasets: [
            {
              label: 'Test label',
              data: counts.data
            }
          ]
        });

        return this.baseConfig;
      }, [])
    );

    this.chart.create(this.chartData);
  }
}
