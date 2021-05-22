import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminCheckinsComponent } from './admin-checkins.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCheckinsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin-view-checkins/admin-view-checkins.module').then((m) => m.AdminViewCheckinsModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-checkins/admin-edit-checkins.module').then((m) => m.AdminEditCheckinsModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-checkins/detail-checkin/admin-detail-checkin.module').then((m) => m.AdminDetailCheckinModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-checkins/admin-add-checkins.module').then((m) => m.AdminAddCheckinsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminCheckinsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminCheckinsModule {}
