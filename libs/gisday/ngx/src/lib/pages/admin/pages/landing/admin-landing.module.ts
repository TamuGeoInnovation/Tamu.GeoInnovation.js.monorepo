import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminLandingComponent } from './admin-landing.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLandingComponent
  }
];

@NgModule({
  declarations: [AdminLandingComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLandingModule {}
