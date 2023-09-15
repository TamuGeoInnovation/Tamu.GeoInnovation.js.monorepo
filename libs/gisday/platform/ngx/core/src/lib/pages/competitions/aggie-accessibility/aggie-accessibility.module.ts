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
  declarations: [AggieAccessibilityComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule],
  exports: [RouterModule]
})
export class AggieAccessibilityModule {}
