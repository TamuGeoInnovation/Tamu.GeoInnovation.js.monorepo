import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewCheckinsComponent } from './admin-view-checkins.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewCheckinsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AdminViewCheckinsComponent],
  exports: [RouterModule]
})
export class AdminViewCheckinsModule {}
