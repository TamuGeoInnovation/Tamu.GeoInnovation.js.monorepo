import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TierAddEditFormComponent } from './tier-add-edit-form.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [TierAddEditFormComponent],
  exports: [TierAddEditFormComponent]
})
export class TierAddEditFormModule {}
