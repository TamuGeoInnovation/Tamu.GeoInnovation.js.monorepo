import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { PartnerProgramFormComponent } from './partner-program-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule, RouterModule],
  declarations: [PartnerProgramFormComponent],
  exports: [PartnerProgramFormComponent]
})
export class PartnerProgramFormModule {}
