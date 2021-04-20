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
  declarations: [SidewalkComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule],
  exports: [RouterModule]
})
export class SidewalkModule {}
