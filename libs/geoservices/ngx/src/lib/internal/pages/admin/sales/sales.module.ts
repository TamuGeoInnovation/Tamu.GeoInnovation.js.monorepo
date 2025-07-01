import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Sales</h1><p>Admin sales functionality will be implemented here.</p></div>'
})
export class SalesComponent {}

const routes: Routes = [
  {
    path: '',
    component: SalesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SalesComponent],
  exports: [RouterModule]
})
export class SalesModule {}
