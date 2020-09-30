import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditRsvpTypeComponent } from './admin-edit-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditRsvpTypeComponent
  }
];

@NgModule({
  declarations: [AdminEditRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditRsvpTypeModule {}
