import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>User Management</h1><p>Admin user management functionality will be implemented here.</p></div>'
})
export class UsersComponent {}

const routes: Routes = [
  {
    path: '',
    component: UsersComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [UsersComponent],
  exports: [RouterModule]
})
export class UsersModule {}
