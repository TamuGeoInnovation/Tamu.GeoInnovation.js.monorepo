import { Routes } from '@angular/router';

import { AdminEditRsvpTypeComponent } from './admin-edit-rsvp-type.component';

export const adminEditRsvpTypeRoutes: Routes = [
  {
    path: '',
    component: AdminEditRsvpTypeComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () =>
      import('./admin-detail-rsvp-type/admin-detail-rsvp-type.routes').then((m) => m.adminDetailRsvpTypeRoutes)
  }
];
