import { Routes } from '@angular/router';

import { PreferencesComponent } from './preferences.component';

export const preferencesRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PreferencesComponent
  }
];
