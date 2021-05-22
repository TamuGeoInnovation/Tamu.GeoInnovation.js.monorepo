import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';

import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./pages/services/services.module').then((m) => m.ServicesModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GeoservicesCoreNgxModule,
    UITileNavigationModule,
    UINavigationTriggersModule
  ],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
