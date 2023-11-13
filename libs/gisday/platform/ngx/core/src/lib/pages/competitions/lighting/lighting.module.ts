import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { LightingComponent } from './lighting.component';

const routes: Routes = [
  {
    path: '',
    component: LightingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, UILayoutModule],
  declarations: [LightingComponent],
  exports: [RouterModule]
})
export class LightingModule {}
