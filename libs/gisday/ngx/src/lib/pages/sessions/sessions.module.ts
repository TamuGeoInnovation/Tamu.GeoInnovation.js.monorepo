import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SessionsComponent } from './sessions.component';

const routes: Routes = [
  {
    path: '',
    component: SessionsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/session-view/session-view.module').then((m) => m.SessionViewModule)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/session-detail/session-detail.module').then((m) => m.SessionDetailModule)
      }
    ]
  }
];

@NgModule({
  declarations: [SessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsModule {}
