import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { StormwaterComponent } from './stormwater.component';

const routes: Routes = [
  {
    path: '',
    component: StormwaterComponent
  }
];

@NgModule({
  declarations: [StormwaterComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule],
  exports: [RouterModule]
})
export class StormwaterModule {}
