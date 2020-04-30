import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardLockdownsComponent } from './dashboard-lockdowns.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLockdownsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DashboardLockdownsComponent]
})
export class DashboardLockdownsModule {}
