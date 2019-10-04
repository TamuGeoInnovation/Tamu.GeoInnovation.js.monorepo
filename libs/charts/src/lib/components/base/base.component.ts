import { Component, ViewChild, Input, AfterViewInit, OnInit } from '@angular/core';

import { ChartContainerComponent, ChartConfiguration } from '../chart-container/chart-container.component';
import { Observable } from 'rxjs';

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

  /**
   * Resolvable collection item property path, whose value is the basis for the provided transformation type.
   *
   * Dot notation supported.
   */
  @Input()
  public path: string;

  /**
   * Chart title.
   */
  @Input()
  public title: string;

  @Input()
  public transformation: 'categorical' | 'ratio';

  /**
   * Transformed `source` data into a `ChartConfiguration` format passed to the `ChartContainerComponent` responsible
   * for rendering the chart.
   */
  public chartData: Observable<any>;

  /**
   * Lays out the structure of a base configuration.
   *
   * Subclasses are responsible for creating datasets and appending
   * them to the base config which is later passed down to the chart
   * container.
   */
  public baseConfig: ChartConfiguration;

  /**
   * ChartContaer component reference.
   *
   * BaseChart sub-classes must include a chart container component in their template.
   *
   * Chart container is responsible for rendering chart.
   */
  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  constructor() {}

  /**
   * `ChartContainerComponent`'s inside template subcless will be avilable here.
   *
   * Perform simple check to make sure we can proceed with chart generation.
   */
  public ngOnInit() {
    if (this.chart === undefined) {
      throw new Error('Subclass does not contain chart container.');
    }
  }

  /**
   * Bound or injected data will be avaiable for use on this lifecycle hook.
   *
   * Every subclass will create chart config at this point in time.
   */
  public ngAfterViewInit() {
    if (this.source === undefined) {
      throw new Error('No chart data source provided.');
    }
  }
}
