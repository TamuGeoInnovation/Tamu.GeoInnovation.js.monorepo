import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEventComponent } from './admin-event.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEventComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-events/admin-view-events.module').then((m) => m.AdminViewEventsModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-events/admin-edit-events.module').then((m) => m.AdminEditEventsModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./edit-events/admin-detail-event/admin-detail-event.module').then((m) => m.AdminDetailEventModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-events/admin-add-events.module').then((m) => m.AdminAddEventsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminEventComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEventModule {}
