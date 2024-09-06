import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PricingComponent } from './pricing.component';
import { InteractivePricingModule } from '../../../core/modules/pricing/interactive-pricing.module';

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
