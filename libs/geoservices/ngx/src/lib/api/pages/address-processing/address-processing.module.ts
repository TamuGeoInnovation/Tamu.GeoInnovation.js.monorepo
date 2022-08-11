import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AddressProcessingComponent } from './address-processing.component';

const routes: Routes = [
  {
    path: '',
    component: AddressProcessingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AddressProcessingComponent]
})
export class AddressProcessingModule {}
