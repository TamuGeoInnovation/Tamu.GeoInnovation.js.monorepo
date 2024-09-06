import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { GeocodeCorrectionFormComponent } from './geocode-correction-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [GeocodeCorrectionFormComponent],
  exports: [GeocodeCorrectionFormComponent]
})
export class GeocodeCorrectionFormModule {}
