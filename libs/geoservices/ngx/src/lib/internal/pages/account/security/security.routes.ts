import { Routes } from '@angular/router';

import { SecurityComponent } from './security.component';

export const securityRoutes: Routes = [
  {
    path: '',
    component: SecurityComponent,
    pathMatch: 'full'
  }
];
