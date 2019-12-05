import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartComponent } from './components/base/base.component';
import { ChartContainerComponent } from './components/chart-container/chart-container.component';

import { BarChartComponent } from './components/bar/bar.component';
import { LineChartComponent } from './components/line/line.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseChartComponent, BarChartComponent, ChartContainerComponent, LineChartComponent],
  exports: [BaseChartComponent, BarChartComponent, LineChartComponent]
})
export class ChartsModule {}
