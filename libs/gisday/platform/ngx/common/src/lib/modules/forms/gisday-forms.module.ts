import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TagAddEditFormComponent } from './components/tags/tag-add-edit/tag-add-edit-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [TagAddEditFormComponent],
  exports: [TagAddEditFormComponent]
})
export class GisdayFormsModule {}

