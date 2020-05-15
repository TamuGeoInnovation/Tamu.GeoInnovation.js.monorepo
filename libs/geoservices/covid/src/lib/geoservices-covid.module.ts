import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GeoservicesCoreNgxModule, LocalEmailGuard } from '@tamu-gisc/geoservices/core/ngx';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';

import { GeoservicesCovidComponent } from './geoservices-covid.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesCovidComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./pages/services/services.module').then((m) => m.ServicesModule)
      },
      {
        path: 'resources',
        loadChildren: () => import('./pages/resources/resources.module').then((m) => m.ResourcesModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.MyDashboardModule),
        canActivate: [LocalEmailGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.module').then((m) => m.AdminModule),
        canActivate: [LocalEmailGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GeoservicesCoreNgxModule,
    UINavigationTriggersModule,
    UITileNavigationModule
  ],
  declarations: [GeoservicesCovidComponent]
})
export class GeoservicesCovidModule {}
