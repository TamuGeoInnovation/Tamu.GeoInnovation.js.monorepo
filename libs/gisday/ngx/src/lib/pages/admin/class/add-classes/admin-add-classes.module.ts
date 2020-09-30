import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddClassesComponent } from './admin-add-classes.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddClassesComponent
  }
];

@NgModule({
  declarations: [AdminAddClassesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddClassesModule {}
