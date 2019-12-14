import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildingDepartmentListComponent } from './components/building-department-list/building-department-list.component';
import { BusListHeaderComponent } from './components/bus-list-header/bus-list-header.component';

@NgModule({
  declarations: [BuildingDepartmentListComponent, BusListHeaderComponent],
  imports: [CommonModule],
  exports: [BuildingDepartmentListComponent, BusListHeaderComponent]
})
export class ReferenceModule {}
