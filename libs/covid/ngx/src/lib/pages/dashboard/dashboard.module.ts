import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { CovidFormsModule } from '../../modules/forms/forms.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'claims'
      },
      {
        path: 'claims',
        loadChildren: () =>
          import('./pages/county-claims/dashboard-county-claims.module').then((m) => m.DashboardCountyClaimsModule)
      },
      {
        path: 'lockdowns',
        loadChildren: () => import('./pages/lockdowns/dashboard-lockdowns.module').then((m) => m.DashboardLockdownsModule)
      },
      {
        path: 'testing-sites',
        loadChildren: () =>
          import('./pages/testing-sites/dashboard-testing-sites.module').then((m) => m.DashboardTestingSitesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), CovidFormsModule],
  declarations: [DashboardComponent]
})
export class MyDashboardModule {}
