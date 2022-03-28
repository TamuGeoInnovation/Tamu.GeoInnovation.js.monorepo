import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { LightPoleComponent } from './light-pole.component';

const routes: Routes = [
  {
    path: '',
    component: LightPoleComponent
  }
];

@NgModule({
  declarations: [LightPoleComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MapsMapboxModule, UILayoutModule],
  exports: [RouterModule]
})
export class LightPoleModule {}
