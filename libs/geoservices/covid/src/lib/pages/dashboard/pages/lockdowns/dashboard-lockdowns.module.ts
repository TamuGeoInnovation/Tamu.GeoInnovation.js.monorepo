import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardLockdownsComponent } from './dashboard-lockdowns.component';
import { DetailsComponent } from './pages/details/details.component';
import { CovidEntityListsModule } from '../../../../modules/lists/lists.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardLockdownsComponent
  },
  {
    path: 'details/:guid',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), CovidEntityListsModule],
  declarations: [DashboardLockdownsComponent, DetailsComponent]
})
export class DashboardLockdownsModule {}
