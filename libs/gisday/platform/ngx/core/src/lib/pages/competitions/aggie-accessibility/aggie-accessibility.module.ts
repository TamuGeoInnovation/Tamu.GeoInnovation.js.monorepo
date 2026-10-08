import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { AggieAccessibilityComponent } from './aggie-accessibility.component';

const routes: Routes = [
  {
    path: '',
    component: AggieAccessibilityComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, AggieAccessibilityComponent],
  exports: [RouterModule]
})
export class AggieAccessibilityModule {}
