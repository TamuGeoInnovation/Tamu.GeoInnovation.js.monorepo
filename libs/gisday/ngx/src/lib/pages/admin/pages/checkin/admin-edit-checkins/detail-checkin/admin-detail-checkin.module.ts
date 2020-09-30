import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailCheckinComponent } from './admin-detail-checkin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailCheckinComponent
  }
];

@NgModule({
  declarations: [AdminDetailCheckinComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailCheckinModule {}
