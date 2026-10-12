import { Routes } from '@angular/router';

import { AdminEditSubmissionTypesComponent } from './admin-edit-submission-types.component';

export const adminEditSubmissionTypesRoutes: Routes = [
  {
    path: '',
    component: AdminEditSubmissionTypesComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () =>
      import('./admin-detail-session-type/admin-detail-session-type.routes').then((m) => m.adminDetailSessionTypeRoutes)
  }
];
