import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeoservicesCoreNgxModule } from '../core/geoservices-core-ngx.module';
import { GeoservicesPublicComponent } from './geoservices-public.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    children: [
      {
        path: 'pricing',
        loadChildren: () => import('./pages/pricing/pricing.module').then((m) => m.PricingModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./pages/services/services.module').then((m) => m.ServicesModule)
      },
      {
        path: 'contact',
        loadChildren: () => import('./pages/contact/contact.module').then((m) => m.ContactModule)
      },
      {
        path: 'about',
        loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
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
    UINavigationTriggersModule,
    UILayoutModule
  ],
  declarations: [GeoservicesPublicComponent]
})
export class GeoservicesPublicModule {}
