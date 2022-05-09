import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { ClientsComponent } from './clients.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/view-client/view-client.module').then((m) => m.ViewClientModule)
      }
      // {
      //   path: 'add',
      //   loadChildren: () => import('./add-role/add-role.module').then((m) => m.AddRoleModule)
      // },
      // {
      //   path: 'edit',
      //   loadChildren: () => import('./edit-role/edit-role.module').then((m) => m.EditRoleModule)
      // }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [ClientsComponent],
  exports: [RouterModule]
})
export class ClientsModule {}

