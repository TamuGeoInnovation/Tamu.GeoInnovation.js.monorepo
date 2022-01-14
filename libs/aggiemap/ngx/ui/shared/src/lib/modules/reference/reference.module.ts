import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildingDepartmentListComponent } from './components/building-department-list/building-department-list.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BuildingDepartmentListComponent],
  exports: [BuildingDepartmentListComponent]
})
export class ReferenceModule {}
