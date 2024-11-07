import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MySubmissionsComponent } from './my-submissions.component';

const routes: Routes = [
  {
    path: '',
    component: MySubmissionsComponent,
    children: [
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./pages/user-submission-edit/user-submission-edit.module').then((m) => m.UserSubmissionEditModule)
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./pages/user-submission-add/user-submission-add.module').then((m) => m.UserSubmissionAddModule)
      },
      {
        path: '',
        loadChildren: () =>
          import('./pages/user-submission-list/user-submission-list.module').then((m) => m.UserSubmissionListModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [MySubmissionsComponent],
  exports: [RouterModule]
})
export class MySubmissionsModule {}
