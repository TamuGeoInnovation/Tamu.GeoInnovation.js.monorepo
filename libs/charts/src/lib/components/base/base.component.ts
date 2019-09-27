import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { ChartContainerComponent } from '../chart-container/chart-container.component';

@Component({
  template: '',
  styleUrls: ['base.component.scss']
})
export class BaseChartComponent implements OnInit, AfterViewInit {
  public data;

  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  constructor() {}

  public ngOnInit() {}

  public ngAfterViewInit() {
    this.chart.create();
  }
}
