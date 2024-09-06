import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PartnerComponent } from './partner.component';
import { PartnerProgramFormModule } from '../../../../../core/modules/forms/partner-program-form/partner-program-form.module';

const routes: Routes = [
  {
    path: '',
    component: PartnerComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PartnerProgramFormModule],
  declarations: [PartnerComponent]
})
export class PartnerModule {}
