import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmissionComponent } from './components/submission/submission.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [SubmissionComponent],
  exports: [SubmissionComponent]
})
export class FormsModule {}
