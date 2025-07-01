import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PartnerProgramFormModule } from '@tamu-gisc/geoservices/ngx/common';

import { PartnerComponent } from './partner.component';

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
