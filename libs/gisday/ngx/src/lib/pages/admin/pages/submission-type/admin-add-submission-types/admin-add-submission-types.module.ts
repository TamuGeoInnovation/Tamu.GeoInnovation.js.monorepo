import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddSubmissionTypesComponent } from './admin-add-submission-types.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddSubmissionTypesComponent
  }
];

@NgModule({
  declarations: [AdminAddSubmissionTypesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddSubmissionTypesModule {}
