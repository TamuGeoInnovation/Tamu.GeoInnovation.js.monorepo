import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin.component';
import { UrlFormHandlerComponent } from './pages/url-form-handler/url-form-handler.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'counties'
      },
      {
        path: 'counties',
        loadChildren: () => import('./pages/admin-counties/admin-counties.module').then((m) => m.AdminCountiesModule)
      },
      {
        path: 'claims',
        loadChildren: () =>
          import('./pages/admin-county-claims/admin-county-claims.module').then((m) => m.AdminCountyClaimsModule)
      },
      {
        path: 'lockdowns',
        loadChildren: () => import('./pages/admin-lockdowns/admin-lockdowns.module').then((m) => m.AdminLockdownsModule)
      },
      {
        path: 'testing-sites',
        loadChildren: () =>
          import('./pages/admin-testing-sites/admin-testing-sites.module').then((m) => m.AdminTestingSitesModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/admin-users/admin-users.module').then((m) => m.AdminUsersModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminComponent, UrlFormHandlerComponent]
})
export class AdminModule {}
