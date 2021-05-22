import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildingDepartmentListComponent } from './components/building-department-list/building-department-list.component';

@NgModule({
  declarations: [BuildingDepartmentListComponent],
  imports: [CommonModule],
  exports: [BuildingDepartmentListComponent]
})
export class ReferenceModule {}
