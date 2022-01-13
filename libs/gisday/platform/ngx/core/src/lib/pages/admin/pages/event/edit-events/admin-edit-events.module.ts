import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditEventsComponent } from './admin-edit-events.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditEventsComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./admin-detail-event/admin-detail-event.module').then((m) => m.AdminDetailEventModule)
  }
];

@NgModule({
  declarations: [AdminEditEventsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditEventsModule {}
