import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ViewRoleComponent } from './view-role.component';

const routes: Routes = [
  {
    path: '',
    component: ViewRoleComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ViewRoleComponent],
  exports: [RouterModule]
})
export class ViewRoleModule {}
