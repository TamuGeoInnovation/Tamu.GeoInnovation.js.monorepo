import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { ManholeMappingComponent } from './manhole-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: ManholeMappingComponent
  }
];

@NgModule({
  declarations: [ManholeMappingComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule],
  exports: [RouterModule]
})
export class ManholeMappingModule {}
