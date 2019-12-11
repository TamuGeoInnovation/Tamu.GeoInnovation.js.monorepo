import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmissionService } from './providers/submission.service';

import { SubmissionComponent } from './components/submission.component';
import { SubmissionCompleteComponent } from './components/complete/complete.component';

const routes: Routes = [
  {
    path: '',
    component: SubmissionComponent
  },
  {
    path: 'complete',
    component: SubmissionCompleteComponent
  }
];

@NgModule({
  declarations: [SubmissionComponent, SubmissionCompleteComponent],
  exports: [SubmissionComponent],
  imports: [RouterModule.forChild(routes), CommonModule, FormsModule, UIFormsModule],
  providers: [SubmissionService]
})
export class SubmissionModule {}
