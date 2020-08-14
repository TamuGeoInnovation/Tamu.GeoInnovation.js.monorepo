import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-users/view-users.module').then((m) => m.ViewUsersModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-users/add-users.module').then((m) => m.AddUsersModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-users/edit-users.module').then((m) => m.EditUsersModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [UsersComponent],
  exports: [RouterModule]
})
export class UsersModule {}
