import { Component, forwardRef, AfterViewInit } from '@angular/core';
import { switchMap, reduce, take, scan } from 'rxjs/operators';
import { BaseChartComponent } from '../base/base.component';
import { of, from, interval, Subject } from 'rxjs';

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

    this.chartData = this.source.pipe(
      scan((acc, curr) => {
        return [...curr];
      }, [])
    );

    this.chart.create(this.chartData);
  }
}
