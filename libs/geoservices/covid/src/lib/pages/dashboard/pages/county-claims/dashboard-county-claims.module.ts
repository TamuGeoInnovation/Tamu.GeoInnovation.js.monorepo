import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardCountyClaimsComponent } from './dashboard-county-claims.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardCountyClaimsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DashboardCountyClaimsComponent]
})
export class DashboardCountyClaimsModule {}
