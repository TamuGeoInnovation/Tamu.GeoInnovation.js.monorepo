import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';

import { ResourcesComponent } from './resources.component';
import { LocalEmailGuard } from '../services/guards/local-email.guard';

const routes: Routes = [
  {
    path: '',
    component: ResourcesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile'
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfileModule)
      },
      {
        path: 'county',
        loadChildren: () => import('./pages/county/county.module').then((m) => m.CountyModule)
      },
      {
        path: 'lockdown',
        loadChildren: () => import('./pages/lockdown/lockdown.module').then((m) => m.LockdownModule)
      },
      {
        path: 'testing-sites',
        loadChildren: () => import('./pages/testing-sites/testing-sites.module').then((m) => m.TestingSitesModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/my-dashboard/my-dashboard.module').then((m) => m.MyDashboardModule),
        canActivate: [LocalEmailGuard]
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GeoservicesCoreNgxModule],
  providers: [LocalEmailGuard],
  declarations: [ResourcesComponent]
})
export class ResourcesModule {}
