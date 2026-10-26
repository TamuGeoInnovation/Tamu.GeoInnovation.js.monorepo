import { Routes } from '@angular/router';

export const uesOperationsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    loadChildren: () => import('./modules/map/map.routes').then((m) => m.mapRoutes)
  }
];
