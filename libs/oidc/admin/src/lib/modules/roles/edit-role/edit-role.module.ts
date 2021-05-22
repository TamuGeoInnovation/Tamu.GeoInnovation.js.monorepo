import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EditRoleComponent } from './edit-role.component';

const routes: Routes = [
  {
    path: '',
    component: EditRoleComponent,
    pathMatch: 'full'
  },
  {
    path: ':roleGuid',
    loadChildren: () => import('./detail-role/detail-role.module').then((m) => m.DetailRoleModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule],
  declarations: [EditRoleComponent],
  exports: [RouterModule]
})
export class EditRoleModule {}
