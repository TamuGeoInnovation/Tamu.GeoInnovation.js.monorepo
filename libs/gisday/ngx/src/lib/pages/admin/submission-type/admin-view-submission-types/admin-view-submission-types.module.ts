import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewSubmissionTypesComponent } from './admin-view-submission-types.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewSubmissionTypesComponent
  }
];

@NgModule({
  declarations: [AdminViewSubmissionTypesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewSubmissionTypesModule {}
