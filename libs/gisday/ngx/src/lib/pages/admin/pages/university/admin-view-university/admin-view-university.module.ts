import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewUniversityComponent } from './admin-view-university.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewUniversityComponent
  }
];

@NgModule({
  declarations: [AdminViewUniversityComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewUniversityModule {}
