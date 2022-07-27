import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddressCorrectionComponent } from './address-correction.component';
import { GeocodeCorrectionFormModule } from '../../../../../core/modules/forms/geocode-correction-form/geocode-correction-form.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AddressCorrectionComponent }]),
    GeocodeCorrectionFormModule
  ],
  declarations: [AddressCorrectionComponent]
})
export class AddressCorrectionModule {}
