import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEventComponent } from './admin-event.component';
import { AdminViewEventsComponent } from './admin-view-events/admin-view-events.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEventComponent
  }
];

@NgModule({
  declarations: [AdminEventComponent, AdminViewEventsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEventModule {}
