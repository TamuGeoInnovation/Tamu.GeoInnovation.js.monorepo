import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Service Management</h1><p>Admin service management functionality will be implemented here.</p></div>'
})
export class ServicesComponent {}

const routes: Routes = [
  {
    path: '',
    component: ServicesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ServicesComponent],
  exports: [RouterModule]
})
export class ServicesModule {}
