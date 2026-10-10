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
  imports: [CommonModule, RouterModule.forChild(routes), AdminLandingComponent],
  exports: [RouterModule]
})
export class AdminLandingModule {}
