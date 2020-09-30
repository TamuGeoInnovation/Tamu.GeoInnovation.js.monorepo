import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailRsvpTypeComponent } from './admin-detail-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailRsvpTypeComponent
  }
];

@NgModule({
  declarations: [AdminDetailRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailRsvpTypeModule {}
