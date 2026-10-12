import { Routes } from '@angular/router';

import { SeasonsListComponent } from './pages/seasons-list/seasons-list.component';
import { SeasonEditComponent } from './pages/season-edit/season-edit.component';

export const seasonsRoutes: Routes = [
  {
    path: 'edit/:guid',
    component: SeasonEditComponent
  },
  {
    path: '',
    component: SeasonsListComponent
  }
];
