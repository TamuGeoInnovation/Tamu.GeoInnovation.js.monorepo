import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AuthorizationComponent } from './authorization.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorizationComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/view/view.module').then((m) => m.ViewModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./pages/add/add.module').then((m) => m.AddModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./pages/edit/edit.module').then((m) => m.EditModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AuthorizationComponent],
  exports: [RouterModule]
})
export class AuthorizationModule {}
