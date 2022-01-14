import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSponsorsComponent } from './admin-edit-sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSponsorsComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./admin-detail-sponsor/admin-detail-sponsor.module').then((m) => m.AdminDetailSponsorModule)
  }
];

@NgModule({
  declarations: [AdminEditSponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSponsorsModule {}
