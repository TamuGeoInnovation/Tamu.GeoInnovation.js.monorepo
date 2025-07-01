import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { InteractivePricingComponent } from './interactive-pricing.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, RouterModule, PipesModule],
  declarations: [InteractivePricingComponent],
  exports: [InteractivePricingComponent]
})
export class InteractivePricingModule {}
