import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardCountyClaimsComponent } from './dashboard-county-claims.component';
import { DetailsComponent } from './pages/details/details.component';
import { CovidEntityListsModule } from '../../../../modules/lists/lists.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardCountyClaimsComponent
  },
  {
    path: 'details/:guid',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), CovidEntityListsModule],
  declarations: [DashboardCountyClaimsComponent, DetailsComponent]
})
export class DashboardCountyClaimsModule {}
