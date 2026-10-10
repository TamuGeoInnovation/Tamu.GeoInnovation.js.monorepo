import { Routes } from '@angular/router';

import { CreditsComponent } from './credits.component';

export const creditsRoutes: Routes = [
  {
    path: '',
    component: CreditsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'balance'
      },
      {
        path: 'balance',
        loadChildren: () => import('./balance/balance.routes').then((m) => m.balanceRoutes)
      },
      {
        path: 'refill',
        loadChildren: () => import('./refill/refill.routes').then((m) => m.refillRoutes)
      }
    ]
  }
];
