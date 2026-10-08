import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewRsvpTypeComponent } from './admin-view-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewRsvpTypeComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AdminViewRsvpTypeComponent],
  exports: [RouterModule]
})
export class AdminViewRsvpTypeModule {}
