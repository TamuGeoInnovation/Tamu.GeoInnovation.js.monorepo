import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Analytics</h1><p>Admin analytics functionality will be implemented here.</p></div>'
})
export class AnalyticsComponent {}

const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AnalyticsComponent],
  exports: [RouterModule]
})
export class AnalyticsModule {}
