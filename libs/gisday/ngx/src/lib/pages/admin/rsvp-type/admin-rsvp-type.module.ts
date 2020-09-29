import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminRsvpTypeComponent } from './admin-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminRsvpTypeComponent
  }
];

@NgModule({
  declarations: [AdminRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRsvpTypeModule {}
