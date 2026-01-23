import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AdminSubmissionsComponent } from './admin-submissions.component';
import { SubmissionReviewSharedModule } from '../../../shared/submission-review-shared.module';

const routes: Routes = [
  {
    path: '',
    component: AdminSubmissionsComponent
  }
];

@NgModule({
  declarations: [AdminSubmissionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SubmissionReviewSharedModule]
})
export class AdminSubmissionsModule {}
