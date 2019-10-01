import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';

import { ChartContainerComponent } from '../chart-container/chart-container.component';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

@Component({
  template: '',
  styleUrls: ['base.component.scss']
})
export class BaseChartComponent{
  /**
   * A collection of items (esri graphics or otherwise) used in processing to generate the `ChartConfig` datasets.
   */
  public data: Observable<any>;

  public $processed: Observable<any>;

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

  constructor() {}
}
