import { Routes } from '@angular/router';

import { SponsorsComponent } from './sponsors.component';

export const sponsorsRoutes: Routes = [
  {
    path: '',
    component: SponsorsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./sponsors-main/sponsors-main.routes').then((m) => m.sponsorsMainRoutes)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./sponsors-detail/sponsors-detail.routes').then((m) => m.sponsorsDetailRoutes)
      },
      {
        path: 'tamu',
        loadChildren: () => import('./sponsors-tamu/sponsors-tamu.routes').then((m) => m.sponsorsTamuRoutes)
      }
    ]
  }
];
