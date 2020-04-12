import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ResourcesComponent } from './resources.component';

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
      // {
      //   path: 'lockdown',
      //   loadChildren: () => import('./pages/lockdown/lockdown.module').then((m) => m.LockdownModule)
      // },
      // {
      //   path: 'testing-sites',
      //   loadChildren: () => import('./pages/testing-sites/testing-sites.module').then((m) => m.TestingSitesModule)
      // }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ResourcesComponent]
})
export class ResourcesModule {}
