import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from './core/core.module';

import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), CoreModule],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
