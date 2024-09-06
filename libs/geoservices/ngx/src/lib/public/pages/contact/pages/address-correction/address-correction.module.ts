import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AddressCorrectionComponent } from './address-correction.component';
import { GeocodeCorrectionFormModule } from '../../../../../core/modules/forms/geocode-correction-form/geocode-correction-form.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AddressCorrectionComponent }]),
    GeocodeCorrectionFormModule
  ],
  declarations: [AddressCorrectionComponent]
})
export class AddressCorrectionModule {}
