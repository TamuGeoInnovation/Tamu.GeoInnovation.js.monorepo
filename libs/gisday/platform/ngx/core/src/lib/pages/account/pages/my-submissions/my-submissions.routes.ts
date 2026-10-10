import { Routes } from '@angular/router';

import { MySubmissionsComponent } from './my-submissions.component';

export const mySubmissionsRoutes: Routes = [
  {
    path: '',
    component: MySubmissionsComponent,
    children: [
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./pages/user-submission-edit/user-submission-edit.routes').then((m) => m.userSubmissionEditRoutes)
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./pages/user-submission-add/user-submission-add.routes').then((m) => m.userSubmissionAddRoutes)
      },
      {
        path: '',
        loadChildren: () =>
          import('./pages/user-submission-list/user-submission-list.routes').then((m) => m.userSubmissionListRoutes)
      }
    ]
  }
];
