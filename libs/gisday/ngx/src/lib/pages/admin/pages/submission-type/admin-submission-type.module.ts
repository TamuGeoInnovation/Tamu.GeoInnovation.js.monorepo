import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminSubmissionTypeComponent } from './admin-submission-type.component';
import { BaseProvider } from 'libs/gisday/data-api/src/lib/providers/_base/base-provider';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';

const routes: Routes = [
  {
    path: '',
    component: AdminSubmissionTypeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin-view-submission-types/admin-view-submission-types.module').then(
            (m) => m.AdminViewSubmissionTypesModule
          )
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./admin-edit-submission-types/admin-edit-submission-types.module').then(
            (m) => m.AdminEditSubmissionTypesModule
          )
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-submission-types/admin-detail-session-type/admin-detail-session-type.module').then(
            (m) => m.AdminDetailSessionTypeModule
          )
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./admin-add-submission-types/admin-add-submission-types.module').then(
            (m) => m.AdminAddSubmissionTypesModule
          )
      }
    ]
  }
];

@NgModule({
  declarations: [AdminSubmissionTypeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSubmissionTypeModule {}
