import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

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
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [AuthorizationComponent],
  exports: [RouterModule]
})
export class AuthorizationModule {}
