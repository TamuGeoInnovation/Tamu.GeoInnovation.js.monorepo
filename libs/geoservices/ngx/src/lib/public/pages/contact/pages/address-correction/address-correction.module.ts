import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AddressCorrectionComponent } from './address-correction.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AddressCorrectionComponent }]),
    AddressCorrectionComponent
  ]
})
export class AddressCorrectionModule {}
