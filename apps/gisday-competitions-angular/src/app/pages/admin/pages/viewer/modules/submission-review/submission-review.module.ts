import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SubmissionReviewComponent } from './submission-review.component';

const routes: Routes = [
  {
    path: '',
    component: SubmissionReviewComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SubmissionReviewComponent]
})
export class SubmissionReviewModule {}
