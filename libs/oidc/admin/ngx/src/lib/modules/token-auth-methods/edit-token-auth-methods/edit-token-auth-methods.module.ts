import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditTokenAuthMethodsComponent } from './edit-token-auth-methods.component';

const routes: Routes = [
  {
    path: '',
    component: EditTokenAuthMethodsComponent,
    pathMatch: 'full'
  },
  {
    path: ':tokenAuthMethodGuid',
    loadChildren: () =>
      import('./detail-token-auth-method/detail-token-auth-method.module').then((m) => m.DetailTokenAuthMethodModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditTokenAuthMethodsComponent],
  exports: [RouterModule]
})
export class EditTokenAuthMethodsModule {}
