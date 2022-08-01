import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

const routes: Routes = [
  {
    path: '',
    component: ReverseGeocodingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ReverseGeocodingComponent]
})
export class ReverseGeocodingModule {}
