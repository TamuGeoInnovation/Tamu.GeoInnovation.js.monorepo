import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GeoservicesCoreNgxModule],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
