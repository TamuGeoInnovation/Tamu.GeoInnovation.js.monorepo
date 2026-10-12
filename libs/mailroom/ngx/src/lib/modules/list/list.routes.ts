import { Routes } from '@angular/router';

import { ListComponent } from './list.component';
import { DetailComponent } from './pages/detail/detail.component';

export const listRoutes: Routes = [
  {
    path: '',
    component: ListComponent
  },
  {
    path: 'detail/:id',
    component: DetailComponent
  }
];
