import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ViewUsersComponent } from './view-users.component';

const routes: Routes = [
  {
    path: '',
    component: ViewUsersComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ViewUsersComponent],
  exports: [RouterModule]
})
export class ViewUsersModule {}
