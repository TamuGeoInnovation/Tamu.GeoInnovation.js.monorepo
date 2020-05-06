import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminUsersComponent } from './admin-users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUsersComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminUsersComponent]
})
export class AdminUsersModule {}
