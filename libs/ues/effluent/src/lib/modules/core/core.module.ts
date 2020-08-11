import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampusOverviewListComponent } from './components/campus-overview-list/campus-overview-list.component';
import { CampusTotalsComponent } from './components/campus-totals/campus-totals.component';

@NgModule({
  imports: [CommonModule],
  declarations: [CampusOverviewListComponent, CampusTotalsComponent],
  exports: [CampusOverviewListComponent, CampusTotalsComponent]
})
export class UESEffluentCoreModule {}
