import { Routes } from '@angular/router';

import { AdminSubmissionTypeComponent } from './admin-submission-type.component';

export const adminSubmissionTypeRoutes: Routes = [
  {
    path: '',
    component: AdminSubmissionTypeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin-view-submission-types/admin-view-submission-types.routes').then(
            (m) => m.adminViewSubmissionTypesRoutes
          )
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./admin-edit-submission-types/admin-edit-submission-types.routes').then(
            (m) => m.adminEditSubmissionTypesRoutes
          )
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-submission-types/admin-detail-session-type/admin-detail-session-type.routes').then(
            (m) => m.adminDetailSessionTypeRoutes
          )
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./admin-add-submission-types/admin-add-submission-types.routes').then(
            (m) => m.adminAddSubmissionTypesRoutes
          )
      }
    ]
  }
];
