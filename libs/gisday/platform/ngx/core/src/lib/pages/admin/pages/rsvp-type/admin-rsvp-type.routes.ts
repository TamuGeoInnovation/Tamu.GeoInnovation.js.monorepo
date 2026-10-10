import { Routes } from '@angular/router';

import { AdminRsvpTypeComponent } from './admin-rsvp-type.component';

export const adminRsvpTypeRoutes: Routes = [
  {
    path: '',
    component: AdminRsvpTypeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin-view-rsvp-type/admin-view-rsvp-type.routes').then((m) => m.adminViewRsvpTypeRoutes)
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./admin-edit-rsvp-type/admin-edit-rsvp-type.routes').then((m) => m.adminEditRsvpTypeRoutes)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-rsvp-type/admin-detail-rsvp-type/admin-detail-rsvp-type.routes').then(
            (m) => m.adminDetailRsvpTypeRoutes
          )
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-rsvp-type/admin-add-rsvp-type.routes').then((m) => m.adminAddRsvpTypeRoutes)
      }
    ]
  }
];
