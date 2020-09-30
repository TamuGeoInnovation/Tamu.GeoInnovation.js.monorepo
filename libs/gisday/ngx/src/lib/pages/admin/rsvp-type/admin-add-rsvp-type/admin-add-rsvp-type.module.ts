import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddRsvpTypeComponent } from './admin-add-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddRsvpTypeComponent
  }
];

@NgModule({
  declarations: [AdminAddRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddRsvpTypeModule {}
