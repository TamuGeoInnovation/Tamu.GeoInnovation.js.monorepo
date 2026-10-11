import { Routes } from '@angular/router';

import { CensusIntersectionComponent } from './census-intersection.component';

export const censusIntersectionRoutes: Routes = [
  {
    path: 'interactive',
    loadChildren: () => import('./pages/interactive/interactive.routes').then((m) => m.interactiveRoutes)
  },
  {
    path: '',
    component: CensusIntersectionComponent
  }
];
