import { Routes } from '@angular/router';

import { SessionExpiredComponent } from '@tamu-gisc/ues/common/ngx';

export const uesOperationsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    loadChildren: () => import('./modules/map/map.routes').then((m) => m.mapRoutes)
  },
  {
    path: 'session/expired',
    component: SessionExpiredComponent
  }
];
