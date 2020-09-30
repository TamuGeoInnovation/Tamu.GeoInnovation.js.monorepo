import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewClassesComponent } from './admin-view-classes.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewClassesComponent
  }
];

@NgModule({
  declarations: [AdminViewClassesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewClassesModule {}
