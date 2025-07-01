import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Admin Tools</h1><p>Admin tools functionality will be implemented here.</p></div>'
})
export class AdminToolsComponent {}

const routes: Routes = [
  {
    path: '',
    component: AdminToolsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminToolsComponent],
  exports: [RouterModule]
})
export class AdminToolsModule {}
