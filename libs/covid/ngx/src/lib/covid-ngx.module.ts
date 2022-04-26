import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/ngx';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';

import { CovidNgxComponent } from './covid-ngx.component';
import { LocalEmailGuard } from './guards/local-email.guard';

const routes: Routes = [
  {
    path: '',
    component: CovidNgxComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/landing/landing.module').then((m) => m.LandingModule)
      },
      {
        path: 'maps',
        loadChildren: () => import('./pages/maps/maps.module').then((m) => m.MapsModule)
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
        loadChildren: () => import('./pages/admin/admin.module').then((m) => m.AdminModule)
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
  declarations: [CovidNgxComponent]
})
export class CovidNgxModule {}
