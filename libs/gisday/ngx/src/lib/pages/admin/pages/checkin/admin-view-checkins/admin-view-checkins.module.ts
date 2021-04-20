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
  declarations: [AdminViewCheckinsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewCheckinsModule {}
