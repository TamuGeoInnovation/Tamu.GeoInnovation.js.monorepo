import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { InteractivePricingComponent } from './interactive-pricing.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, RouterModule],
  declarations: [InteractivePricingComponent],
  exports: [InteractivePricingComponent]
})
export class InteractivePricingModule {}
