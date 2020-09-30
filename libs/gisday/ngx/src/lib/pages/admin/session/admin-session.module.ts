import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminSessionComponent } from './admin-session.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSessionComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin-view-sessions/admin-view-sessions.module').then((m) => m.AdminViewSessionsModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-sessions/admin-edit-sessions.module').then((m) => m.AdminEditSessionsModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-sessions/admin-detail-session/admin-detail-session.module').then(
            (m) => m.AdminDetailSessionModule
          )
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-sessions/admin-add-sessions.module').then((m) => m.AdminAddSessionsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminSessionComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSessionModule {}
