import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/ngx';
import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';

import { LandingComponent } from './landing.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, GeoservicesCoreNgxModule, MapsMapboxModule],
  declarations: [LandingComponent]
})
export class LandingModule {}
