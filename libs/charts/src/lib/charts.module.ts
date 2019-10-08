import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseChartComponent } from './components/base/base.component';
import { BarChartComponent } from './components/bar/bar.component';
import { ChartContainerComponent } from './components/chart-container/chart-container.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseChartComponent, BarChartComponent, ChartContainerComponent],
  exports: [BarChartComponent]
})
export class ChartsModule {}
