import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InfoComponent } from './info.component';

const routes: Routes = [
  {
    path: '',
    component: InfoComponent,
    children: [
      {
        path: 'details/:id',
        loadChildren: () => import('./pages/details/details.module').then((m) => m.DetailsModule)
      },
      {
        path: 'intervention/new/:valveId',
        loadChildren: () => import('./pages/intervention/intervention.module').then((m) => m.InterventionModule)
      },
      {
        path: 'intervention/:id',
        loadChildren: () => import('./pages/intervention/intervention.module').then((m) => m.InterventionModule)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/list/list.module').then((m) => m.ListModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule {}
