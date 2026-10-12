import { Route, Routes } from '@angular/router';

import { InternalComponent } from './geoservices-internal.component';

export const geoservicesModulesInternalRoutes: Route[] = [];

export const geoservicesInternalRoutes: Routes = [
  {
    path: '',
    component: InternalComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account'
      },
      {
        path: 'account',
        loadChildren: () => import('./pages/account/account.routes').then((m) => m.accountRoutes)
      },
      {
        path: 'credits',
        loadChildren: () => import('./pages/credits/credits.routes').then((m) => m.creditsRoutes)
      },
      {
        path: 'databases',
        loadChildren: () => import('./pages/databases/databases.routes').then((m) => m.databasesRoutes)
      }
    ]
  }
];
