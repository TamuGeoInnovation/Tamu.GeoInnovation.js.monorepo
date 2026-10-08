import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ManholeMappingComponent } from './manhole-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: ManholeMappingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ManholeMappingComponent],
  exports: [RouterModule]
})
export class ManholeMappingModule {}
