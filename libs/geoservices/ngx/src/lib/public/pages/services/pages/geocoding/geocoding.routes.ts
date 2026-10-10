import { Routes } from '@angular/router';

import { GeocodingComponent } from './geocoding.component';

export const geocodingRoutes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.routes').then((m) => m.interactiveRoutes)
  },
  {
    path: '',
    component: GeocodingComponent
  }
];
