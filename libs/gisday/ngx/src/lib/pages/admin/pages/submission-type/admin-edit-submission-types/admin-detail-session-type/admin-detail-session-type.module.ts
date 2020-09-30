import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailSessionTypeComponent } from './admin-detail-session-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailSessionTypeComponent
  }
];

@NgModule({
  declarations: [AdminDetailSessionTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailSessionTypeModule {}
