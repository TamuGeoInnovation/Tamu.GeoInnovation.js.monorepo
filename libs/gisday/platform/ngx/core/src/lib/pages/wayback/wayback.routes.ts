import { Routes } from '@angular/router';

import { WaybackComponent } from './wayback.component';

export const waybackRoutes: Routes = [
  {
    path: '',
    component: WaybackComponent,
    children: [
      {
        path: '2019',
        loadChildren: () => import('./wayback-2019/wayback-2019.routes').then((m) => m.wayback2019Routes)
      }
    ]
  }
];
