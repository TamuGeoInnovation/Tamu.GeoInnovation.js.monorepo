import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [EditRoleComponent],
  exports: [RouterModule]
})
export class EditRoleModule {}
