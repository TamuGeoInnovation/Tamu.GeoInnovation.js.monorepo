import { Routes } from '@angular/router';

import { RsvpDashboardComponent } from './rsvp-dashboard/rsvp-dashboard.component';

/** The admin dashboards (#2878). Each is a child here and an entry under Dashboards in the admin menu. */
export const dashboardsRoutes: Routes = [
  {
    path: 'rsvps',
    component: RsvpDashboardComponent
  },
  {
    path: '',
    redirectTo: 'rsvps',
    pathMatch: 'full'
  }
];
