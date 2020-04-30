import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'claims'
      },
      {
        path: 'claims',
        loadChildren: () =>
          import('./pages/county-claims/dashboard-county-claims.module').then((m) => m.DashboardCountyClaimsModule)
      },
      {
        path: 'lockdowns',
        loadChildren: () => import('./pages/lockdowns/dashboard-lockdowns.module').then((m) => m.DashboardLockdownsModule)
      },
      {
        path: 'testing-sites',
        loadChildren: () =>
          import('./pages/testing-sites/dashboard-testing-sites.module').then((m) => m.DashboardTestingSitesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, GeoservicesCoreNgxModule, RouterModule.forChild(routes)],
  declarations: [DashboardComponent]
})
export class MyDashboardModule {}
