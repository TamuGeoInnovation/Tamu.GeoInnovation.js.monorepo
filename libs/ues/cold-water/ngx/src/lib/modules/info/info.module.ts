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
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/list/list.module').then((m) => m.ListModule)
      },
      {
        path: 'details/:id',
        loadChildren: () => import('./pages/details/details.module').then((m) => m.DetailsModule)
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
