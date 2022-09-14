import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { PartnerProgramFormComponent } from './partner-program-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [PartnerProgramFormComponent],
  exports: [PartnerProgramFormComponent]
})
export class PartnerProgramFormModule {}
