import { Routes } from '@angular/router';

import { RsvpDashboardComponent } from './rsvp-dashboard/rsvp-dashboard.component';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { SpeakerBadgesComponent } from './speaker-badges/speaker-badges.component';
import { CheckInDashboardComponent } from './check-in-dashboard/check-in-dashboard.component';
import { VgiDashboardComponent } from './vgi-dashboard/vgi-dashboard.component';

/** The admin dashboards (#2878). Each is a child here and an entry under Dashboards in the admin menu. */
export const dashboardsRoutes: Routes = [
  {
    path: 'rsvps',
    component: RsvpDashboardComponent
  },
  {
    path: 'check-ins',
    component: CheckInDashboardComponent
  },
  {
    path: 'vgi-submissions',
    component: VgiDashboardComponent
  },
  {
    path: 'accounts',
    component: AccountDashboardComponent
  },
  {
    path: 'speaker-badges',
    component: SpeakerBadgesComponent
  },
  {
    path: '',
    redirectTo: 'rsvps',
    pathMatch: 'full'
  }
];
