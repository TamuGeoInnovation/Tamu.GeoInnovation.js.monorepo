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
  public transformation: 'categorical' | 'ratio';

  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  public chartData: Observable<any>;

  constructor() {}

  /**
   * ChartContainerComponents within subclass templates will be avilable here.
   *
   * Perform simple check to make sure we can proceed with chart generation.
   */
  public ngOnInit() {
    if (this.chart === undefined) {
      throw new Error('Subclass does not contain chart container.');
    }
  }

  /**
   * Bound or injected data will be avaiable for use at this lifecycle hook.
   *
   * Every subclass will create chart config at this point in time.
   */
  public ngAfterViewInit() {
    if (this.source === undefined) {
      throw new Error('No chart data source provided.');
    }
  }
}
