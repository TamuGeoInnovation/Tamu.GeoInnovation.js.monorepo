import { Routes } from '@angular/router';

import { AdminCheckinsComponent } from './admin-checkins.component';

export const adminCheckinsRoutes: Routes = [
  {
    path: '',
    component: AdminCheckinsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin-view-checkins/admin-view-checkins.routes').then((m) => m.adminViewCheckinsRoutes)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-checkins/admin-edit-checkins.routes').then((m) => m.adminEditCheckinsRoutes)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-checkins/detail-checkin/admin-detail-checkin.routes').then((m) => m.adminDetailCheckinRoutes)
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-checkins/admin-add-checkins.routes').then((m) => m.adminAddCheckinsRoutes)
      }
    ]
  }
];
