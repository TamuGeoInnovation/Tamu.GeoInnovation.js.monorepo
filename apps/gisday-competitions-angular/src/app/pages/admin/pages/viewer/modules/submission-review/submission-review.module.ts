import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmissionReviewComponent } from './submission-review.component';

const routes: Routes = [
  {
    path: '',
    component: SubmissionReviewComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule],
  declarations: [SubmissionReviewComponent]
})
export class SubmissionReviewModule {}
