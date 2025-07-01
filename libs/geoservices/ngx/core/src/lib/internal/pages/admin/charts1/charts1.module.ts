import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Charts1</h1><p>Admin charts1 functionality will be implemented here.</p></div>'
})
export class Charts1Component {}

const routes: Routes = [
  {
    path: '',
    component: Charts1Component
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [Charts1Component],
  exports: [RouterModule]
})
export class Charts1Module {}
