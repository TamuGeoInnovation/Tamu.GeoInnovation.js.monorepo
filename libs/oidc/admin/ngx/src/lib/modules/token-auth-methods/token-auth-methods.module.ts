import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { TokenAuthMethodsComponent } from './token-auth-methods.component';

const routes: Routes = [
  {
    path: '',
    component: TokenAuthMethodsComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./view-token-auth-methods/view-token-auth-methods.module').then((m) => m.ViewTokenAuthMethodsModule)
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./add-token-auth-methods/add-token-auth-methods.module').then((m) => m.AddTokenAuthMethodsModule)
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./edit-token-auth-methods/edit-token-auth-methods.module').then((m) => m.EditTokenAuthMethodsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [TokenAuthMethodsComponent],
  exports: [RouterModule]
})
export class TokenAuthMethodsModule {}
