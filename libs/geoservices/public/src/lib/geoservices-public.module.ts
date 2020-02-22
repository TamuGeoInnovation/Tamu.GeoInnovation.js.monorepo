import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';

import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GeoservicesCoreNgxModule, UITileNavigationModule],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
