import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
