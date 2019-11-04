import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubmissionComponent } from '../../components/submission/submission.component';

@NgModule({
  declarations: [SubmissionComponent],
  exports: [SubmissionComponent],
  imports: [
    CommonModule
  ]
})
export class SubmissionModule { }
