import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { GeocodeCorrectionFormModule } from '@tamu-gisc/geoservices/ngx/common';

import { AddressCorrectionComponent } from './address-correction.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AddressCorrectionComponent }]),
    GeocodeCorrectionFormModule
  ],
  declarations: [AddressCorrectionComponent]
})
export class AddressCorrectionModule {}
