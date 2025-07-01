import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Diagnostics</h1><p>Admin diagnostics functionality will be implemented here.</p></div>'
})
export class DiagnosticsComponent {}

const routes: Routes = [
  {
    path: '',
    component: DiagnosticsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DiagnosticsComponent],
  exports: [RouterModule]
})
export class DiagnosticsModule {}
