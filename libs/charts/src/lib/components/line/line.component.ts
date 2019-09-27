import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseChartComponent } from '../base/base.component';

@Component({
  selector: 'tamu-gisc-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['../base/base.component.scss', './line.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => LineChartComponent) }]
})
export class LineChartComponent extends BaseChartComponent {
  constructor() {
    super();
  }
}
