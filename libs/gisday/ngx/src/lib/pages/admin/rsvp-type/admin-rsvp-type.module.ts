import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminRsvpTypeComponent } from './admin-rsvp-type.component';

const routes: Routes = [
  {
    path: '',
    component: AdminRsvpTypeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin-view-rsvp-type/admin-view-rsvp-type.module').then((m) => m.AdminViewRsvpTypeModule)
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./admin-edit-rsvp-type/admin-edit-rsvp-type.module').then((m) => m.AdminEditRsvpTypeModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-rsvp-type/admin-detail-rsvp-type/admin-detail-rsvp-type.module').then(
            (m) => m.AdminDetailRsvpTypeModule
          )
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-rsvp-type/admin-add-rsvp-type.module').then((m) => m.AdminAddRsvpTypeModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminRsvpTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRsvpTypeModule {}
