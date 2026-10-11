import { Routes } from '@angular/router';

import { DetailsComponent } from './details.component';

export const detailsRoutes: Routes = [
  {
    path: '',
    component: DetailsComponent,
    pathMatch: 'full'
  }
];
