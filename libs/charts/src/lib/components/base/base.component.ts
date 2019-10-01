import { Component, ViewChild, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

import { ChartContainerComponent } from '../chart-container/chart-container.component';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

@Component({
  template: '',
  styleUrls: ['base.component.scss']
})
export class BaseChartComponent implements OnInit, AfterViewInit {
  /**
   * A collection of items (esri graphics or otherwise) used in processing to generate the `ChartConfig` datasets.
   */
  @Input()
  public source: Observable<any>;

  @Input()
  public xPath: string;

  @Input()
  public yPath: string;

  @Input()
  public xFunction: 'unique' | MonoTypeOperatorFunction<any>;

  @Input()
  public yFunction: 'count' | MonoTypeOperatorFunction<any>;

  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  public chartData: Observable<any>;

  constructor() {}

  public ngOnInit() {
    if (this.chart === undefined) {
      throw new Error('Subclass does not contain chart container.');
    }
  }

  public ngAfterViewInit() {
    if (this.source === undefined) {
      throw new Error('No chart data source provided.');
    }
  }
}
