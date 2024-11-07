import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

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
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  declarations: [MySubmissionsComponent],
  exports: [RouterModule]
})
export class MySubmissionsModule {}
