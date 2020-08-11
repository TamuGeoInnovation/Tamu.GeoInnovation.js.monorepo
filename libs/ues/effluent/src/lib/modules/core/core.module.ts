import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampusOverviewListComponent } from './components/campus-overview-list/campus-overview-list.component';

@NgModule({
  imports: [CommonModule],
  declarations: [CampusOverviewListComponent],
  exports: [CampusOverviewListComponent]
})
export class UESEffluentCoreModule {}
