import { Routes } from '@angular/router';

import { AdminEditCheckinsComponent } from './admin-edit-checkins.component';

export const adminEditCheckinsRoutes: Routes = [
  {
    path: '',
    component: AdminEditCheckinsComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./detail-checkin/admin-detail-checkin.routes').then((m) => m.adminDetailCheckinRoutes)
  }
];
