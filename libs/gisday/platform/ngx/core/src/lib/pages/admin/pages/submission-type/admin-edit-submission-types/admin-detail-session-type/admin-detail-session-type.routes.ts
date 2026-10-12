import { Routes } from '@angular/router';

import { AdminDetailSessionTypeComponent } from './admin-detail-session-type.component';

export const adminDetailSessionTypeRoutes: Routes = [
  {
    path: '',
    component: AdminDetailSessionTypeComponent,
    pathMatch: 'full'
  }
];
