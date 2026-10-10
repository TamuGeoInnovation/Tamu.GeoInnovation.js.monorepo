import { Routes } from '@angular/router';

import { SubmissionComponent } from './components/submission.component';
import { SubmissionCompleteComponent } from './components/complete/complete.component';

export const submissionRoutes: Routes = [
  {
    path: '',
    component: SubmissionComponent
  },
  {
    path: 'complete',
    component: SubmissionCompleteComponent
  }
];
