import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminSponsorComponent } from './admin-sponsor.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSponsorComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin-view-sponsors/admin-view-sponsors.module').then((m) => m.AdminViewSponsorsModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-sponsors/admin-edit-sponsors.module').then((m) => m.AdminEditSponsorsModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-sponsors/admin-detail-sponsor/admin-detail-sponsor.module').then(
            (m) => m.AdminDetailSponsorModule
          )
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-sponsors/admin-add-sponsors.module').then((m) => m.AdminAddSponsorsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminSponsorComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSponsorModule {}
