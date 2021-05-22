import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSubmissionTypesComponent } from './admin-edit-submission-types.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSubmissionTypesComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () =>
      import('./admin-detail-session-type/admin-detail-session-type.module').then((m) => m.AdminDetailSessionTypeModule)
  }
];
@NgModule({
  declarations: [AdminEditSubmissionTypesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSubmissionTypesModule {}
