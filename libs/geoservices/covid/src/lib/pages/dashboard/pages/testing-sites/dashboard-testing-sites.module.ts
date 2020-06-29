import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardTestingSitesComponent } from './dashboard-testing-sites.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardTestingSitesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DashboardTestingSitesComponent]
})
export class DashboardTestingSitesModule {}
