import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSubmissionTypesComponent } from './admin-edit-submission-types.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSubmissionTypesComponent
  }
];

@NgModule({
  declarations: [AdminEditSubmissionTypesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSubmissionTypesModule {}
