import { Routes } from '@angular/router';

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

export const reverseGeocodingRoutes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.routes').then((m) => m.interactiveRoutes)
  },
  {
    path: '',
    component: ReverseGeocodingComponent
  }
];
