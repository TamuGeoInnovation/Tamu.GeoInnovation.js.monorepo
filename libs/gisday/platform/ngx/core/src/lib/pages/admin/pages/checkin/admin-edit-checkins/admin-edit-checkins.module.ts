import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditCheckinsComponent } from './admin-edit-checkins.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditCheckinsComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./detail-checkin/admin-detail-checkin.module').then((m) => m.AdminDetailCheckinModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AdminEditCheckinsComponent],
  exports: [RouterModule]
})
export class AdminEditCheckinsModule {}
