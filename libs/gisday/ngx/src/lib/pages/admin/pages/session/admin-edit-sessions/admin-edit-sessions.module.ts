import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSessionsComponent } from './admin-edit-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSessionsComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./admin-detail-session/admin-detail-session.module').then((m) => m.AdminDetailSessionModule)
  }
];

@NgModule({
  declarations: [AdminEditSessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSessionsModule {}
