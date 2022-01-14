import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GrantTypesComponent } from './grant-types.component';

const routes: Routes = [
  {
    path: '',
    component: GrantTypesComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-grant-types/view-grant-types.module').then((m) => m.ViewGrantTypesModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-grant-types/add-grant-types.module').then((m) => m.AddGrantTypesModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-grant-types/edit-grant-types.module').then((m) => m.EditGrantTypesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [GrantTypesComponent],
  exports: [RouterModule]
})
export class GrantTypesModule {}
