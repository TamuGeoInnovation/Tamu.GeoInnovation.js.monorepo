import { Routes } from '@angular/router';

import { AddressProcessingComponent } from './address-processing.component';

export const addressProcessingRoutes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.routes').then((m) => m.interactiveRoutes)
  },
  {
    path: '',
    component: AddressProcessingComponent
  }
];
