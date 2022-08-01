import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BugReportComponent } from './bug-report.component';
import { SubmitBugFormModule } from '../../../../../core/modules/forms/submit-bug-form/submit-bug-form.module';

const routes: Routes = [
  {
    path: '',
    component: BugReportComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SubmitBugFormModule],
  declarations: [BugReportComponent]
})
export class BugReportModule {}
