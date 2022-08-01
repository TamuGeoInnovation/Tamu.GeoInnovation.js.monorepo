import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddressProcessingComponent } from './address-processing.component';
import { RouterModule, Routes } from '@angular/router';

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
