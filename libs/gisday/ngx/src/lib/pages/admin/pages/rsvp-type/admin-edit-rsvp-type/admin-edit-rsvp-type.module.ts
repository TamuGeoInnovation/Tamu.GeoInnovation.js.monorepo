import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditRsvpTypeComponent } from './admin-edit-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditRsvpTypeComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () =>
      import('./admin-detail-rsvp-type/admin-detail-rsvp-type.module').then((m) => m.AdminDetailRsvpTypeModule)
  }
];

@NgModule({
  declarations: [AdminEditRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditRsvpTypeModule {}
