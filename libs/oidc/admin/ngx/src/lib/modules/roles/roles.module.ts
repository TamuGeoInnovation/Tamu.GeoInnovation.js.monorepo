import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { RolesComponent } from './roles.component';

const routes: Routes = [
  {
    path: '',
    component: RolesComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-role/view-role.module').then((m) => m.ViewRoleModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-role/add-role.module').then((m) => m.AddRoleModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-role/edit-role.module').then((m) => m.EditRoleModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [RolesComponent],
  exports: [RouterModule]
})
export class RolesModule {}
