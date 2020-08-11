import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsModule } from '@tamu-gisc/charts';

import { CampusOverviewListComponent } from './components/campus-overview-list/campus-overview-list.component';
import { CampusTotalsComponent } from './components/campus-totals/campus-totals.component';
import { CoverageChartComponent } from './components/coverage-chart/coverage-chart.component';
import { BuildingTypeChartComponent } from './components/building-type-chart/building-type-chart.component';

@NgModule({
  imports: [CommonModule, ChartsModule],
  declarations: [CampusOverviewListComponent, CampusTotalsComponent, CoverageChartComponent, BuildingTypeChartComponent],
  exports: [CampusOverviewListComponent, CampusTotalsComponent]
})
export class UESEffluentCoreModule {}
