import { Component, forwardRef, AfterViewInit, OnInit } from '@angular/core';
import { delay, switchMap, toArray, take, scan, reduce } from 'rxjs/operators';
import { BaseChartComponent } from '../base/base.component';
import { of, from } from 'rxjs';

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
    this.$processed = this.data.pipe(
      take(1),
      switchMap((list) => from(list)),
      switchMap((el) => {
        return of(el);
      }),
      reduce((acc, curr) => {
        return [...acc, curr];
      }, [])
    );

    this.chart.create(this.$processed);
  }
}
