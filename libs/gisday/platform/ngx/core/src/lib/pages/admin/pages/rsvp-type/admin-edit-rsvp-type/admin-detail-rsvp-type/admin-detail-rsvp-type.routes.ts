import { Routes } from '@angular/router';

import { AdminDetailRsvpTypeComponent } from './admin-detail-rsvp-type.component';

export const adminDetailRsvpTypeRoutes: Routes = [
  {
    path: '',
    component: AdminDetailRsvpTypeComponent,
    pathMatch: 'full'
  }
];
