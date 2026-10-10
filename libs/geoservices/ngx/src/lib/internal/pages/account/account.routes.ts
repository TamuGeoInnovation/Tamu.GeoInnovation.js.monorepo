import { Routes } from '@angular/router';

import { AccountComponent } from './account.component';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./details/details.routes').then((m) => m.detailsRoutes)
      },
      {
        path: 'security',
        loadChildren: () => import('./security/security.routes').then((m) => m.securityRoutes)
      },
      {
        path: 'preferences',
        loadChildren: () => import('./preferences/preferences.routes').then((m) => m.preferencesRoutes)
      }
    ]
  }
];
