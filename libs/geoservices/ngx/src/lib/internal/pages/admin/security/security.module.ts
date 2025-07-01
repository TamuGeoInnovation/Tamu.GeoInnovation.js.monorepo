import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Security</h1><p>Admin security functionality will be implemented here.</p></div>'
})
export class SecurityComponent {}

const routes: Routes = [
  {
    path: '',
    component: SecurityComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SecurityComponent],
  exports: [RouterModule]
})
export class SecurityModule {}
