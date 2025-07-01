import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InteractivePricingModule } from '@tamu-gisc/geoservices/ngx/common';

import { PricingComponent } from './pricing.component';

const routes: Routes = [
  {
    path: '',
    component: PricingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), InteractivePricingModule],
  declarations: [PricingComponent]
})
export class PricingModule {}
