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
        redirectTo: 'testing-sites'
      },
      {
        path: 'testing-sites',
        loadChildren: () => import('./pages/testing-sites/testing-sites.module').then((m) => m.TestingSitesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ResourcesComponent]
})
export class ResourcesModule {}
