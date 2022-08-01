import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { SubmitBugFormComponent } from './submit-bug-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [SubmitBugFormComponent],
  exports: [SubmitBugFormComponent]
})
export class SubmitBugFormModule {}
