import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/ngx';
import { UINavigationTriggersModule } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { UITileNavigationModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';

import { DashboardComponent } from './dashboard.component';
import { TWOHeaderModule } from './components/header/header.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/status/status.module').then((m) => m.StatusModule)
      },
      {
        path: 'site/:siteCode',
        loadChildren: () => import('./pages/site/site.module').then((m) => m.SiteModule)
      }
    ]
  }
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    TWOHeaderModule,
    RouterModule.forChild(routes),
    GeoservicesCoreNgxModule,
    UINavigationTriggersModule,
    UITileNavigationModule
  ]
})
export class DashboardModule {}
