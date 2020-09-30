import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditClassesComponent } from './admin-edit-classes.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditClassesComponent
  }
];

@NgModule({
  declarations: [AdminEditClassesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditClassesModule {}
