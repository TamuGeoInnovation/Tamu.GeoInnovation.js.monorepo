import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SubmissionComponent } from '../../components/submission/submission.component';

const routes: Routes = [{
  path: '', component: SubmissionComponent
}]

@NgModule({
  declarations: [SubmissionComponent],
  exports: [SubmissionComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ]
})
export class SubmissionModule { }
