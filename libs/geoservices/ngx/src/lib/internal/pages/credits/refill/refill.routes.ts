import { Routes } from '@angular/router';

import { RefillComponent } from './refill.component';

export const refillRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RefillComponent
  }
];
