import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Reports</h1><p>Admin reports functionality will be implemented here.</p></div>'
})
export class ReportsComponent {}

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ReportsComponent],
  exports: [RouterModule]
})
export class ReportsModule {}
