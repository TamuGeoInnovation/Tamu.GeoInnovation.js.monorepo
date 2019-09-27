import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartComponent } from './components/base/base.component';
import { LineChartComponent } from './components/line/line.component';
import { ChartContainerComponent } from './components/chart-container/chart-container.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseChartComponent, LineChartComponent, ChartContainerComponent],
  exports: [LineChartComponent]
})
export class ChartsModule {}
