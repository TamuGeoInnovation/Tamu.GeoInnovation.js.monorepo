import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmissionService } from './services/submission.service';
import { SubmissionComponent } from './components/submission.component';
import { SubmissionCompleteComponent } from './components/complete/complete.component';
import { FormsModule as GISDayCompetitionsFormsModule } from '../../../modules/forms/forms.module';

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
  imports: [RouterModule.forChild(routes), CommonModule, FormsModule, UIFormsModule, GISDayCompetitionsFormsModule],
  declarations: [SubmissionComponent, SubmissionCompleteComponent],
  exports: [SubmissionComponent],
  providers: [SubmissionService]
})
export class SubmissionModule {}
