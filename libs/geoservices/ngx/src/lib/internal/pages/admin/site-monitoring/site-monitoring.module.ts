import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Site Monitoring</h1><p>Admin site monitoring functionality will be implemented here.</p></div>'
})
export class SiteMonitoringComponent {}

const routes: Routes = [
  {
    path: '',
    component: SiteMonitoringComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SiteMonitoringComponent],
  exports: [RouterModule]
})
export class SiteMonitoringModule {}
