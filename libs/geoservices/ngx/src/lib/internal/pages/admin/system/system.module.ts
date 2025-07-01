import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>System Settings</h1><p>Admin system settings functionality will be implemented here.</p></div>'
})
export class SystemComponent {}

const routes: Routes = [
  {
    path: '',
    component: SystemComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SystemComponent],
  exports: [RouterModule]
})
export class SystemModule {}
