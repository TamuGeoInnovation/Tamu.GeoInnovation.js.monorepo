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
      },
      {
        path: 'add',
        loadChildren: () => import('./pages/add-client/add-client.module').then((m) => m.AddClientModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./pages/edit-client/edit-client.module').then((m) => m.EditClientModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [ClientsComponent],
  exports: [RouterModule]
})
export class ClientsModule {}
