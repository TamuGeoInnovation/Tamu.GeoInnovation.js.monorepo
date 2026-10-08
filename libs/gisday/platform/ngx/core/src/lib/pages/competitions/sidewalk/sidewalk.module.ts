import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { SidewalkComponent } from './sidewalk.component';

const routes: Routes = [
  {
    path: '',
    component: SidewalkComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, SidewalkComponent],
  exports: [RouterModule]
})
export class SidewalkModule {}
