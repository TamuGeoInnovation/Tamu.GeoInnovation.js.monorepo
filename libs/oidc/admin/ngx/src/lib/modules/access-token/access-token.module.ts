import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AccessTokenComponent } from './access-token.component';

const routes: Routes = [
  {
    path: '',
    component: AccessTokenComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-access-token/view-access-token.module').then((m) => m.ViewAccessTokenModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-access-token/edit-access-token.module').then((m) => m.EditAccessTokenModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [AccessTokenComponent],
  exports: [RouterModule]
})
export class AccessTokenModule {}
