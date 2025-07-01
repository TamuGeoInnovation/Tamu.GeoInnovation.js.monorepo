import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeoservicesAdminComponent } from './geoservices-admin.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesAdminComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users'
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./services/services.module').then((m) => m.ServicesModule)
      },
      {
        path: 'analytics',
        loadChildren: () => import('./analytics/analytics.module').then((m) => m.AnalyticsModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('./billing/billing.module').then((m) => m.BillingModule)
      },
      {
        path: 'system',
        loadChildren: () => import('./system/system.module').then((m) => m.SystemModule)
      },
      {
        path: 'logs',
        loadChildren: () => import('./logs/logs.module').then((m) => m.LogsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [GeoservicesAdminComponent],
  exports: [RouterModule]
})
export class GeoservicesAdminModule {}
