import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

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
      }
      // {
      //   path: 'preferences',
      //   loadChildren: () => import('./preferences/preferences.module').then((m) => m.PreferencesModule)
      // }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [RolesComponent],
  exports: [RouterModule]
})
export class RolesModule {}
