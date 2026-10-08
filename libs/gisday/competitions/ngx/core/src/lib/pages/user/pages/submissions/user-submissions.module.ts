import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UserSubmissionsComponent } from './user-submissions.component';
import { SubmissionReviewSharedModule } from '../../../shared/submission-review-shared.module';

const routes: Routes = [
  {
    path: '',
    component: UserSubmissionsComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), SubmissionReviewSharedModule, UserSubmissionsComponent]
})
export class UserSubmissionsModule {}
